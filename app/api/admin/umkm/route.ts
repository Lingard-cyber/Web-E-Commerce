import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;
  try {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = textValue(body?.name, 160);
  const slug = slugValue(body?.slug || name);
  if (!name || !slug) return validationError("Nama UMKM wajib diisi.");
  if (await prisma.umkm.findUnique({ where: { slug }, select: { id: true } })) return NextResponse.json({ error: "Slug UMKM sudah digunakan." }, { status: 409 });
  const created = await prisma.umkm.create({ data: {
    name, slug, description: textValue(body?.description, 8000) || null,
    ownerName: textValue(body?.ownerName, 160) || null, businessType: textValue(body?.businessType, 500) || null,
    nib: textValue(body?.nib, 160) || null, halalPermit: textValue(body?.halalPermit, 160) || null, sppirt: textValue(body?.sppirt, 160) || null,
    privateKtp: textValue(body?.ktp, 80) || null, privateAddress: textValue(body?.address, 1000) || null,
    isPublished: Boolean(body?.isPublished), publicContact: { instagram: textValue(body?.instagram, 160) || "", profileImage: textValue(body?.profileImage, 6 * 1024 * 1024) || "" },
  } });
  await prisma.auditLog.create({ data: { action: "create", entity: "umkm", entityId: created.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom" } } });
  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath("/kategori");
  revalidatePath(`/umkm/${created.slug}`);
  revalidateTag("public-umkm");
  revalidateTag("public-catalog");
  return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Admin UMKM profile create failed:", error);
    return NextResponse.json({ error: "Profil belum tersimpan karena server gagal mengakses database. Periksa koneksi database lalu coba lagi." }, { status: 503 });
  }
}
