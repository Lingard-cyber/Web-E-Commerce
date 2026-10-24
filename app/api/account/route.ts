import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDatabaseUser } from "@/lib/account-server";

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const user = await getCurrentDatabaseUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const [addresses, orders] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, publicCode: true, status: true, totalIdr: true, createdAt: true, payment: { select: { status: true } }, shipment: { select: { status: true, courier: true, trackingNumber: true } }, items: { select: { productName: true, variantId: true, variantLabel: true, quantity: true, unitPriceIdr: true, variant: { select: { isActive: true, priceIdr: true, product: { select: { slug: true, publishStatus: true } } } } } } } }),
  ]);
  return NextResponse.json({ user, addresses, orders: orders.map((order) => ({ ...order, items: order.items.map((item) => ({ ...item, available: item.variant.isActive && item.variant.priceIdr !== null && item.variant.product.publishStatus === "published", productSlug: item.variant.product.slug })) })) });
}

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const user = await getCurrentDatabaseUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const body = await request.json().catch(() => null) as { name?: string; phone?: string } | null;
  const name = body?.name?.trim().slice(0, 120);
  const phone = body?.phone?.trim().slice(0, 40) || null;
  if (!name) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
  const updated = await prisma.user.update({ where: { id: user.id }, data: { name, phone }, select: { id: true, email: true, name: true, phone: true } });
  return NextResponse.json({ user: updated });
}
