import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, textValue, validationError } from "@/lib/admin-api";

const shipmentOrder = { packed: "processing", shipped: "shipped", delivered: "completed" } as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await request.json().catch(() => null) as { shipmentStatus?: unknown; courier?: unknown; trackingNumber?: unknown } | null;
  const shipmentStatus = body?.shipmentStatus;
  if (shipmentStatus !== "packed" && shipmentStatus !== "shipped" && shipmentStatus !== "delivered") return validationError("Status pengiriman tidak valid.");
  const courier = textValue(body?.courier, 100) || null;
  const trackingNumber = textValue(body?.trackingNumber, 120) || null;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: params.id }, include: { payment: true, shipment: true } });
      if (!current) throw new Error("Pesanan tidak ditemukan.");
      if (current.payment?.status !== "paid") throw new Error("Pengiriman hanya dapat diproses setelah pembayaran tervalidasi.");
      const currentStatus = current.shipment?.status || "pending";
      const allowedNext = currentStatus === "pending" ? "packed" : currentStatus === "packed" ? "shipped" : currentStatus === "shipped" ? "delivered" : currentStatus;
      if (shipmentStatus !== currentStatus && shipmentStatus !== allowedNext) throw new Error("Status pengiriman harus diperbarui secara berurutan.");
      const shippedAt = shipmentStatus === "shipped" ? current.shipment?.shippedAt || new Date() : current.shipment?.shippedAt;
      const deliveredAt = shipmentStatus === "delivered" ? current.shipment?.deliveredAt || new Date() : current.shipment?.deliveredAt;
      await tx.shipment.upsert({ where: { orderId: current.id }, create: { orderId: current.id, status: shipmentStatus, courier, trackingNumber, shippedAt, deliveredAt }, update: { status: shipmentStatus, courier, trackingNumber, shippedAt, deliveredAt } });
      const orderStatus = shipmentOrder[shipmentStatus];
      const updated = await tx.order.update({ where: { id: current.id }, data: { status: orderStatus } });
      await tx.auditLog.create({ data: { action: "fulfillment-update", entity: "order", entityId: current.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom", publicCode: current.publicCode, previousShipmentStatus: currentStatus, shipmentStatus, previousOrderStatus: current.status, orderStatus, courier, trackingNumber } } });
      return updated;
    });
    revalidatePath("/admin/pesanan-produk");
    return NextResponse.json({ ok: true, status: order.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status pengiriman gagal diperbarui.";
    const status = message === "Pesanan tidak ditemukan." ? 404 : message === "Status pengiriman gagal diperbarui." ? 500 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
