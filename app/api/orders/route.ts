import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthUser } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";
import { createXenditPaymentSession } from "@/lib/xendit";

type OrderBody = { idempotencyKey?: string; items?: Array<{ variantId?: string; quantity?: number }>; address?: { recipientName?: string; phone?: string; address?: string; village?: string; district?: string; regency?: string; postalCode?: string } };

export async function POST(request: Request) {
  if (process.env.ENABLE_CHECKOUT !== "true") return NextResponse.json({ error: "Checkout belum tersedia." }, { status: 503 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  if (!process.env.XENDIT_SECRET_KEY) return NextResponse.json({ error: "Pembayaran belum dikonfigurasi oleh admin." }, { status: 503 });
  const { data: { user: authUser } } = await createClient().auth.getUser();
  if (!authUser?.email) return NextResponse.json({ error: "Silakan masuk sebelum checkout." }, { status: 401 });
  await syncAuthUser(authUser);

  const body = await request.json().catch(() => null) as OrderBody | null;
  const idempotencyKey = body?.idempotencyKey?.trim();
  const requestedItems = body?.items || [];
  const address = body?.address;
  if (!idempotencyKey || idempotencyKey.length > 100 || requestedItems.length === 0) return NextResponse.json({ error: "Item dan idempotency key wajib diisi." }, { status: 400 });
  if (!address?.recipientName?.trim() || !address.phone?.trim() || !address.address?.trim()) return NextResponse.json({ error: "Nama penerima, nomor telepon, dan alamat wajib diisi." }, { status: 400 });

  const databaseUser = await prisma.user.findUnique({ where: { authId: authUser.id }, select: { id: true, name: true, phone: true } });
  if (!databaseUser) return NextResponse.json({ error: "Profil akun belum tersinkron. Silakan coba lagi." }, { status: 409 });
  const normalizedItems = requestedItems.map((item) => ({ variantId: String(item.variantId || ""), quantity: Number(item.quantity) })).filter((item) => item.variantId && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99);
  if (normalizedItems.length !== requestedItems.length) return NextResponse.json({ error: "Data item pesanan tidak valid." }, { status: 400 });
  const quantities = new Map<string, number>();
  for (const item of normalizedItems) quantities.set(item.variantId, (quantities.get(item.variantId) || 0) + item.quantity);

  const existingOrder = await prisma.order.findUnique({ where: { idempotencyKey }, include: { payment: true } });
  if (existingOrder) return NextResponse.json({ publicCode: existingOrder.publicCode, checkoutUrl: existingOrder.payment?.checkoutUrl || null });
  const variants = await prisma.productVariant.findMany({ where: { id: { in: Array.from(quantities.keys()) }, isActive: true, product: { publishStatus: "published", productType: { not: "service" } } }, include: { product: true } });
  if (variants.length !== quantities.size) return NextResponse.json({ error: "Salah satu produk sudah tidak tersedia." }, { status: 409 });
  for (const variant of variants) {
    const quantity = quantities.get(variant.id) || 0;
    if (variant.priceIdr === null) return NextResponse.json({ error: `Harga ${variant.product.name} belum tersedia.` }, { status: 409 });
    if (variant.stockQty !== null && variant.stockQty < quantity) return NextResponse.json({ error: `Stok ${variant.product.name} tidak mencukupi.` }, { status: 409 });
  }

  const items = variants.map((variant) => { const quantity = quantities.get(variant.id) || 0; return { productId: variant.productId, variantId: variant.id, productName: variant.product.name, variantLabel: variant.label, quantity, unitPriceIdr: variant.priceIdr as number, subtotalIdr: (variant.priceIdr as number) * quantity }; });
  const subtotalIdr = items.reduce((sum, item) => sum + item.subtotalIdr, 0);
  const publicCode = `KPH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const shippingSnapshot = { recipientName: address.recipientName.trim(), phone: address.phone.trim(), address: address.address.trim(), village: address.village?.trim() || null, district: address.district?.trim() || null, regency: address.regency?.trim() || null, postalCode: address.postalCode?.trim() || null };

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      const createdAddress = await tx.address.create({ data: { userId: databaseUser.id, label: "Checkout", recipientName: shippingSnapshot.recipientName, phone: shippingSnapshot.phone, address: shippingSnapshot.address, village: shippingSnapshot.village, district: shippingSnapshot.district, regency: shippingSnapshot.regency, postalCode: shippingSnapshot.postalCode } });
      for (const item of items) {
        const variant = variants.find((value) => value.id === item.variantId);
        if (variant?.stockQty !== null) {
          const updated = await tx.productVariant.updateMany({ where: { id: item.variantId, stockQty: { gte: item.quantity } }, data: { stockQty: { decrement: item.quantity } } });
          if (updated.count !== 1) throw new Error("Stok berubah. Silakan ulangi checkout.");
          await tx.stockMovement.create({ data: { variantId: item.variantId, quantity: -item.quantity, reason: "order_reserved", referenceId: idempotencyKey } });
        }
      }
      return tx.order.create({ data: { publicCode, userId: databaseUser.id, addressId: createdAddress.id, status: "pending_payment", subtotalIdr, shippingIdr: 0, discountIdr: 0, totalIdr: subtotalIdr, shippingAddressSnapshot: shippingSnapshot, idempotencyKey, items: { create: items }, payment: { create: { provider: "xendit_session", status: "pending" } }, shipment: { create: { status: "pending" } } } });
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pesanan belum dapat dibuat." }, { status: 409 });
  }

  try {
    const session = await createXenditPaymentSession({ referenceId: order.publicCode, amount: order.totalIdr, email: authUser.email, name: databaseUser.name, phone: databaseUser.phone, siteUrl: process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin });
    await prisma.payment.update({ where: { orderId: order.id }, data: { providerPaymentId: session.payment_session_id, checkoutUrl: session.payment_link_url, rawLastEvent: session } });
    return NextResponse.json({ publicCode: order.publicCode, checkoutUrl: session.payment_link_url }, { status: 201 });
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
      await tx.payment.update({ where: { orderId: order.id }, data: { status: "failed", rawLastEvent: { error: error instanceof Error ? error.message : "xendit_error" } } });
      for (const item of items) {
        const variant = variants.find((value) => value.id === item.variantId);
        if (variant?.stockQty !== null) { await tx.productVariant.update({ where: { id: item.variantId }, data: { stockQty: { increment: item.quantity } } }); await tx.stockMovement.create({ data: { variantId: item.variantId, quantity: item.quantity, reason: "order_release_payment_error", referenceId: order.id } }); }
      }
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment session belum dapat dibuat." }, { status: 502 });
  }
}
