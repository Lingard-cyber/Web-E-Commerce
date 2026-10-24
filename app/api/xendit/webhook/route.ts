import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  const received = request.headers.get("x-callback-token");
  if (!expected || !received || received !== expected) return NextResponse.json({ error: "Webhook tidak terautentikasi." }, { status: 401 });
  const payload = await request.json().catch(() => null) as { event?: string; data?: { payment_session_id?: string; reference_id?: string; status?: string } } | null;
  if (!payload?.event || !payload.data) return NextResponse.json({ error: "Payload webhook tidak valid." }, { status: 400 });
  const data = payload.data;
  const eventId = `${data.payment_session_id || data.reference_id || "unknown"}:${payload.event}`;
  const existingEvent = await prisma.paymentEvent.findUnique({ where: { providerEventId: eventId }, select: { id: true } });
  if (existingEvent) return NextResponse.json({ ok: true, duplicate: true });

  const order = data.reference_id ? await prisma.order.findUnique({ where: { publicCode: data.reference_id }, include: { payment: true, items: true } }) : null;
  if (!order?.payment) {
    await prisma.paymentEvent.create({ data: { provider: "xendit_session", providerEventId: eventId, eventType: payload.event, payload: payload as object } });
    return NextResponse.json({ ok: true, ignored: true });
  }

  const normalizedEvent = payload.event.toLowerCase();
  const isPaid = normalizedEvent.includes("completed") || normalizedEvent.includes("paid") || data.status?.toLowerCase() === "completed";
  const isExpired = normalizedEvent.includes("expired") || normalizedEvent.includes("cancelled") || normalizedEvent.includes("canceled") || data.status?.toLowerCase() === "expired";
  const nextPaymentStatus = isPaid ? "paid" : isExpired ? "expired" : "pending";
  const nextOrderStatus = isPaid ? "paid" : isExpired ? "expired" : "pending_payment";

  try {
    await prisma.$transaction(async (tx) => {
      await tx.paymentEvent.create({ data: { provider: "xendit_session", providerEventId: eventId, eventType: payload.event as string, payload: payload as object, paymentId: order.payment!.id } });
      if (order.payment!.status === "paid" || order.payment!.status === "expired" || order.payment!.status === "failed") return;
      await tx.payment.update({ where: { id: order.payment!.id }, data: { status: nextPaymentStatus, providerPaymentId: data.payment_session_id || order.payment!.providerPaymentId, rawLastEvent: payload as object, paidAt: isPaid ? new Date() : null } });
      await tx.order.update({ where: { id: order.id }, data: { status: nextOrderStatus } });
      if (isExpired) {
        for (const item of order.items) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId }, select: { stockQty: true } });
          if (variant?.stockQty !== null) { await tx.productVariant.update({ where: { id: item.variantId }, data: { stockQty: { increment: item.quantity } } }); await tx.stockMovement.create({ data: { variantId: item.variantId, quantity: item.quantity, reason: "order_release_expired", referenceId: order.id } }); }
        }
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: "Webhook belum dapat diproses." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
