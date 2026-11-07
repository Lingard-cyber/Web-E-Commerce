import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, validationError } from "@/lib/admin-api";

const statuses = ["new", "contacted", "quoted", "completed", "cancelled"] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await request.json().catch(() => null) as { status?: unknown } | null;
  if (typeof body?.status !== "string" || !statuses.includes(body.status as (typeof statuses)[number])) return validationError("Status permintaan jasa tidak valid.");
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const inquiry = await tx.serviceInquiry.findUnique({ where: { id: params.id }, select: { id: true, status: true } });
      if (!inquiry) throw new Error("Permintaan jasa tidak ditemukan.");
      const result = await tx.serviceInquiry.update({ where: { id: inquiry.id }, data: { status: body.status as (typeof statuses)[number] } });
      await tx.auditLog.create({ data: { action: "status-update", entity: "service-inquiry", entityId: inquiry.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom", previousStatus: inquiry.status, status: result.status } } });
      return result;
    });
    revalidatePath("/admin/jasa");
    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status permintaan jasa gagal diperbarui.";
    return NextResponse.json({ error: message }, { status: message === "Permintaan jasa tidak ditemukan." ? 404 : 500 });
  }
}
