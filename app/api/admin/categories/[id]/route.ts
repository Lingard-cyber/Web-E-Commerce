import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi, textValue, validationError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const categoryStatuses = ["coming_soon", "published"] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { admin, response } = await requireAdminApi();
  if (response) return response;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = textValue(body?.status, 20) as typeof categoryStatuses[number];
  if (!categoryStatuses.includes(status)) return validationError("Status kategori tidak valid.");

  const current = await prisma.category.findUnique({ where: { id: params.id }, select: { id: true, slug: true } });
  if (!current) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });

  const category = await prisma.$transaction(async (tx) => {
    const updated = await tx.category.update({ where: { id: params.id }, data: { status } });
    if (admin?.databaseUserId) await tx.auditLog.create({ data: { userId: admin.databaseUserId, action: "update", entity: "category", entityId: current.id, metadata: { status } } });
    return updated;
  });

  revalidateTag("public-catalog");
  revalidatePath("/");
  revalidatePath("/kategori");
  revalidatePath("/produk");
  revalidatePath("/jasa");
  revalidatePath(`/kategori/${current.slug}`);
  revalidatePath("/admin/kategori");
  return NextResponse.json({ category });
}
