import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const categoryStatuses = ["coming_soon", "published"] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { admin, response } = await requireAdminApi();
  if (response) return response;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const current = await prisma.category.findUnique({ where: { id: params.id }, select: { id: true, name: true, slug: true, description: true, sortOrder: true, status: true } });
  if (!current) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });
  const status = (body && "status" in body ? textValue(body.status, 20) : current.status) as typeof categoryStatuses[number];
  if (!categoryStatuses.includes(status)) return validationError("Status kategori tidak valid.");
  const name = textValue(body?.name, 120) || current.name;
  const slug = slugValue(body?.slug || name);
  const description = body && "description" in body ? textValue(body.description, 1000) || null : current.description;
  const sortOrder = body && "sortOrder" in body ? Number(body.sortOrder) : current.sortOrder;
  if (!name || !slug) return validationError("Nama dan slug kategori wajib diisi.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) return validationError("Urutan harus berupa angka 0 sampai 9999.");
  const duplicate = await prisma.category.findFirst({ where: { slug, id: { not: params.id } }, select: { id: true } });
  if (duplicate) return NextResponse.json({ error: "Slug kategori sudah digunakan." }, { status: 409 });

  const category = await prisma.$transaction(async (tx) => {
    const updated = await tx.category.update({ where: { id: params.id }, data: { name, slug, description, sortOrder, status } });
    if (admin?.databaseUserId) await tx.auditLog.create({ data: { userId: admin.databaseUserId, action: "update", entity: "category", entityId: current.id, metadata: { name, slug, status } } });
    return updated;
  });

  revalidateTag("public-catalog");
  revalidatePath("/");
  revalidatePath("/kategori");
  revalidatePath("/produk");
  revalidatePath("/jasa");
  revalidatePath(`/kategori/${current.slug}`);
  revalidatePath(`/kategori/${slug}`);
  revalidatePath("/admin/kategori");
  return NextResponse.json({ category });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { admin, response } = await requireAdminApi();
  if (response) return response;
  const current = await prisma.category.findUnique({ where: { id: params.id }, select: { id: true, slug: true, name: true, _count: { select: { products: true } } } });
  if (!current) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });
  if (current._count.products > 0) return NextResponse.json({ error: `Kategori masih dipakai oleh ${current._count.products} produk atau jasa. Ubah statusnya menjadi Coming soon jika belum ingin ditampilkan.` }, { status: 409 });

  await prisma.$transaction(async (tx) => {
    await tx.category.delete({ where: { id: params.id } });
    if (admin?.databaseUserId) await tx.auditLog.create({ data: { userId: admin.databaseUserId, action: "delete", entity: "category", entityId: current.id, metadata: { name: current.name, slug: current.slug } } });
  });
  revalidateTag("public-catalog");
  revalidatePath("/");
  revalidatePath("/kategori");
  revalidatePath("/produk");
  revalidatePath("/jasa");
  revalidatePath("/admin/kategori");
  return NextResponse.json({ ok: true });
}
