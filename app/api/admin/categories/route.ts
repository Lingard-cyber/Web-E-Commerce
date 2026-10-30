import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = textValue(body?.name, 120);
  const slug = slugValue(body?.slug || name);
  const description = textValue(body?.description, 1000) || null;
  const sortOrder = Number(body?.sortOrder ?? 0);
  const requestedStatus = textValue(body?.status, 20) || "published";
  const status = requestedStatus as "coming_soon" | "published";
  if (!name || !slug) return validationError("Nama dan slug kategori wajib diisi.");
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) return validationError("Urutan harus berupa angka 0 sampai 9999.");
  if (status !== "coming_soon" && status !== "published") return validationError("Status kategori tidak valid.");

  try {
    const created = await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({ data: { name, slug, description, sortOrder, status } });
      await tx.auditLog.create({ data: { action: "create", entity: "category", entityId: category.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom" } } });
      return category;
    });
    revalidateTag("public-catalog");
    revalidatePath("/");
    revalidatePath("/kategori");
    revalidatePath("/produk");
    revalidatePath("/jasa");
    revalidatePath("/admin/kategori");
    revalidatePath("/admin/produk");
    revalidatePath("/admin/jasa");
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Slug kategori sudah digunakan." }, { status: 409 });
    return NextResponse.json({ error: "Kategori belum dapat disimpan." }, { status: 500 });
  }
}
