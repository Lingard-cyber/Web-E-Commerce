import Link from "next/link";
import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { formatAdminDate, labelStatus } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const admin = await requireAdmin();
  const [services, inquiries, categories, umkm] = process.env.DATABASE_URL ? await Promise.all([
    prisma.product.findMany({ where: { productType: "service", publishStatus: { not: "archived" } }, orderBy: { updatedAt: "desc" }, include: { variants: { where: { isActive: true }, take: 1 }, images: { where: { isPrimary: true }, take: 1 } } }),
    prisma.serviceInquiry.findMany({ orderBy: { createdAt: "desc" }, include: { product: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.umkm.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]) : [[], [], [], []];
  const items = services.map((service) => ({ id: service.id, name: service.name, slug: service.slug, description: service.description, categoryId: service.categoryId, umkmId: service.umkmId, publishStatus: service.publishStatus, serviceBookingMode: service.serviceBookingMode, serviceRequirements: service.serviceRequirements, serviceAvailability: service.serviceAvailability, serviceDuration: service.serviceDuration, imageUrl: service.images[0]?.imageUrl || "", isHero: service.images[0]?.isHero || false, variantLabel: service.variants[0]?.label || "Konsultasi", priceIdr: service.variants[0]?.priceIdr ?? null, stockQty: null }));
  return <AdminShell name={admin.name} email={admin.email}><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Layanan</p><h1 className="mt-2 font-display text-3xl font-bold">Manajemen Jasa</h1><p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">Jasa dikelola terpisah dari produk. Admin dapat menentukan apakah layanan menggunakan booking langsung atau penawaran harga.</p></div><AdminProductManager mode="service" categories={categories} umkm={umkm} initialItems={items} /><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Permintaan jasa masuk</h2><p className="mt-1 text-xs text-muted">Inquiry tetap dipisahkan dari pesanan produk.</p></div><Link href="/jasa" className="text-[10px] font-bold text-forest-800">Buka storefront jasa</Link></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-muted"><tr><th className="pb-3">Pemohon</th><th className="pb-3">Jasa</th><th className="pb-3">Kontak</th><th className="pb-3">Status</th><th className="pb-3">Diterima</th></tr></thead><tbody className="divide-y divide-slate-100">{inquiries.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-muted">Belum ada permintaan jasa.</td></tr> : inquiries.map((inquiry) => <tr key={inquiry.id}><td className="py-3 font-semibold">{inquiry.name}</td><td className="py-3">{inquiry.product.name}</td><td className="py-3">{inquiry.contact}</td><td className="py-3"><span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-800">{labelStatus(inquiry.status)}</span></td><td className="py-3 text-muted">{formatAdminDate(inquiry.createdAt)}</td></tr>)}</tbody></table></div></section></AdminShell>;
}
