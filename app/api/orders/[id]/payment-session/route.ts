import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDatabaseUser } from "@/lib/account-server";
import { createXenditPaymentSession, getXenditSiteUrl } from "@/lib/xendit";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentDatabaseUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk untuk melanjutkan pembayaran." }, { status: 401 });
  const order = await prisma.order.findFirst({ where: { publicCode: params.id, userId: user.id }, include: { payment: true } });
  if (!order || !order.payment) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (order.status !== "pending_payment" || order.payment.status !== "pending") return NextResponse.json({ error: "Pesanan ini tidak menunggu pembayaran." }, { status: 409 });

  try {
    const siteUrl = getXenditSiteUrl(_request);
    const session = await createXenditPaymentSession({ referenceId: order.publicCode, amount: order.totalIdr, email: user.email, name: user.name, phone: user.phone, siteUrl });
    await prisma.payment.update({ where: { orderId: order.id }, data: { providerPaymentId: session.payment_session_id, checkoutUrl: null, rawLastEvent: { payment_session_id: session.payment_session_id, mode: "COMPONENTS" } } });
    return NextResponse.json({ publicCode: order.publicCode, componentsSdkKey: session.components_sdk_key, amount: order.totalIdr });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sesi pembayaran belum dapat dibuat." }, { status: 502 });
  }
}
