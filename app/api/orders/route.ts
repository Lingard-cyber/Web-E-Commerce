import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthUser } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";
import { createXenditPaymentSession, getXenditComponentsSdkKey } from "@/lib/xendit";

type OrderBody = { idempotencyKey?: string; items?: Array<{ variantId?: string; quantity?: number }>; addressId?: string };

export async function POST(request: Request) {
  if (process.env.ENABLE_CHECKOUT !== "true") return NextResponse.json({ error: "Pesanan belum dapat diproses saat ini. Silakan coba lagi." }, { status: 503 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  if (!process.env.XENDIT_SECRET_KEY) return NextResponse.json({ error: "Pembayaran belum dikonfigurasi oleh admin." }, { status: 503 });
  const { data: { user: authUser } } = await createClient().auth.getUser();
  if (!authUser?.email) return NextResponse.json({ error: "Silakan masuk sebelum checkout." }, { status: 401 });
  await syncAuthUser(authUser);

  const body = await request.json().catch(() => null) as OrderBody | null;
  const idempotencyKey = body?.idempotencyKey?.trim();
  const requestedItems = body?.items || [];
  if (!idempotencyKey || idempotencyKey.length > 100 || requestedItems.length === 0) return NextResponse.json({ error: "Item dan idempotency key wajib diisi." }, { status: 400 });
  if (!body?.addressId?.trim()) return NextResponse.json({ error: "Pilih alamat pengiriman dari profil Anda." }, { status: 400 });

  const databaseUser = await prisma.user.findUnique({ where: { authId: authUser.id }, select: { id: true, name: true, phone: true } });
  if (!databaseUser) return NextResponse.json({ error: "Profil akun belum tersinkron. Silakan coba lagi." }, { status: 409 });
  const address = await prisma.address.findFirst({ where: { id: body.addressId, userId: databaseUser.id } });
  if (!address) return NextResponse.json({ error: "Alamat tidak ditemukan di profil Anda. Muat ulang halaman dan pilih alamat yang tersedia." }, { status: 404 });
  const normalizedItems = requestedItems.map((item) => ({ variantId: String(item.variantId || ""), quantity: Number(item.quantity) })).filter((item) => item.variantId && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99);
  if (normalizedItems.length !== requestedItems.length) return NextResponse.json({ error: "Data item pesanan tidak valid." }, { status: 400 });
  const quantities = new Map<string, number>();
  for (const item of normalizedItems) quantities.set(item.variantId, (quantities.get(item.variantId) || 0) + item.quantity);

  const existingOrder = await prisma.order.findUnique({ where: { idempotencyKey }, include: { payment: true } });
  if (existingOrder) {
    const componentsSdkKey = existingOrder.payment?.providerPaymentId ? await getXenditComponentsSdkKey(existingOrder.payment.providerPaymentId).catch(() => null) : null;
    return componentsSdkKey
      ? NextResponse.json({ publicCode: existingOrder.publicCode, componentsSdkKey })
      : NextResponse.json({ error: "Sesi pembayaran sudah kedaluwarsa. Silakan buat pesanan kembali." }, { status: 409 });
  }
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
  const shippingSnapshot = { recipientName: address.recipientName, phone: address.phone, address: address.address, village: address.village, district: address.district, regency: address.regency, postalCode: address.postalCode };

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const variant = variants.find((value) => value.id === item.variantId);
        if (variant?.stockQty !== null) {
          const updated = await tx.productVariant.updateMany({ where: { id: item.variantId, stockQty: { gte: item.quantity } }, data: { stockQty: { decrement: item.quantity } } });
          if (updated.count !== 1) throw new Error("Stok berubah. Silakan ulangi checkout.");
          await tx.stockMovement.create({ data: { variantId: item.variantId, quantity: -item.quantity, reason: "order_reserved", referenceId: idempotencyKey } });
        }
      }
      return tx.order.create({ data: { publicCode, userId: databaseUser.id, addressId: address.id, status: "pending_payment", subtotalIdr, shippingIdr: 0, discountIdr: 0, totalIdr: subtotalIdr, shippingAddressSnapshot: shippingSnapshot, idempotencyKey, items: { create: items }, payment: { create: { provider: "xendit_session", status: "pending" } }, shipment: { create: { status: "pending" } } } });
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pesanan belum dapat dibuat." }, { status: 409 });
  }

  try {
    const requestUrl = new URL(request.url);
    const isLocalHost = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1" || requestUrl.hostname === "[::1]";
    const siteUrl = isLocalHost ? requestUrl.origin : process.env.NEXT_PUBLIC_STORE_URL || process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
    const session = await createXenditPaymentSession({ referenceId: order.publicCode, amount: order.totalIdr, email: authUser.email, name: databaseUser.name, phone: databaseUser.phone, siteUrl });
    await prisma.payment.update({ where: { orderId: order.id }, data: { providerPaymentId: session.payment_session_id, rawLastEvent: { payment_session_id: session.payment_session_id, mode: "COMPONENTS" } } });
    return NextResponse.json({ publicCode: order.publicCode, componentsSdkKey: session.components_sdk_key }, { status: 201 });
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
