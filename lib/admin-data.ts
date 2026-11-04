import { prisma } from "@/lib/prisma";
export { formatAdminDate, formatAdminRupiah, labelStatus } from "@/lib/admin-format";

export type AdminDashboardData = {
  available: boolean;
  error?: string;
  counts: {
    products: number;
    services: number;
    umkm: number;
    orders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    inquiries: number;
    paidRevenue: number;
  };
  salesByMonth: Array<{
    label: string;
    orders: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    publicCode: string;
    status: string;
    totalIdr: number;
    createdAt: Date;
    customer: string;
    payment: string;
  }>;
  recentInquiries: Array<{
    id: string;
    name: string;
    contact: string;
    product: string;
    status: string;
    createdAt: Date;
  }>;
};

const emptyData: AdminDashboardData = {
  available: false,
  counts: { products: 0, services: 0, umkm: 0, orders: 0, pendingOrders: 0, processingOrders: 0, completedOrders: 0, inquiries: 0, paidRevenue: 0 },
  salesByMonth: [],
  recentOrders: [],
  recentInquiries: [],
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!process.env.DATABASE_URL) return { ...emptyData, error: "DATABASE_URL belum dikonfigurasi." };

  try {
    const startOfPeriod = new Date();
    startOfPeriod.setDate(1);
    startOfPeriod.setHours(0, 0, 0, 0);
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 5);

    const [products, services, umkm, orders, pendingOrders, processingOrders, completedOrders, inquiries, revenue, monthlyOrders, recentOrders, recentInquiries] = await Promise.all([
      prisma.product.count({ where: { productType: { not: "service" }, publishStatus: { not: "archived" } } }),
      prisma.product.count({ where: { productType: "service", publishStatus: { not: "archived" } } }),
      prisma.umkm.count({ where: { isPublished: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["pending_payment", "paid"] } } }),
      prisma.order.count({ where: { status: "processing" } }),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.serviceInquiry.count({ where: { status: { not: "completed" } } }),
      prisma.order.aggregate({
        where: { status: { notIn: ["cancelled", "expired"] }, payment: { status: "paid" } },
        _sum: { totalIdr: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfPeriod } },
        select: { createdAt: true, totalIdr: true, status: true, payment: { select: { status: true } } },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: { id: true, publicCode: true, status: true, totalIdr: true, createdAt: true, user: { select: { name: true, email: true } }, payment: { select: { status: true } } },
      }),
      prisma.serviceInquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, contact: true, status: true, createdAt: true, product: { select: { name: true } } },
      }),
    ]);

    const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short" });
    const salesByMonth = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(startOfPeriod);
      date.setMonth(startOfPeriod.getMonth() + index);
      return { year: date.getFullYear(), month: date.getMonth(), label: monthFormatter.format(date), orders: 0, revenue: 0 };
    });

    for (const order of monthlyOrders) {
      const bucket = salesByMonth.find((item) => item.year === order.createdAt.getFullYear() && item.month === order.createdAt.getMonth());
      if (!bucket) continue;
      bucket.orders += 1;
      if (order.payment?.status === "paid" && !["cancelled", "expired"].includes(order.status)) bucket.revenue += order.totalIdr;
    }

    return {
      available: true,
      counts: { products, services, umkm, orders, pendingOrders, processingOrders, completedOrders, inquiries, paidRevenue: revenue._sum.totalIdr || 0 },
      salesByMonth: salesByMonth.map(({ label, orders: monthOrders, revenue: monthRevenue }) => ({ label, orders: monthOrders, revenue: monthRevenue })),
      recentOrders: recentOrders.map((order) => ({ id: order.id, publicCode: order.publicCode, status: order.status, totalIdr: order.totalIdr, createdAt: order.createdAt, customer: order.user.name || order.user.email, payment: order.payment?.status || "pending" })),
      recentInquiries: recentInquiries.map((inquiry) => ({ id: inquiry.id, name: inquiry.name, contact: inquiry.contact, product: inquiry.product.name, status: inquiry.status, createdAt: inquiry.createdAt })),
    };
  } catch (error) {
    return { ...emptyData, error: error instanceof Error ? error.message : "Database tidak dapat diakses." };
  }
}

