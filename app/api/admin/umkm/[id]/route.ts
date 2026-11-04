import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  try {
  const current = await prisma.umkm.findUnique({ where: { id: params.id }, select: { id: true, name: true, slug: true, description: true, isPublished: true, publicContact: true, ownerName: true, businessType: true, nib: true, halalPermit: true, sppirt: true, privateKtp: true, privateAddress: true } });
  if (!current) return NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = textValue(body?.name, 160) || current.name;
  const slug = body && "slug" in body ? slugValue(body.slug) || current.slug : current.slug;
  const duplicate = await prisma.umkm.findFirst({ where: { slug, id: { not: params.id } }, select: { id: true } });
  if (duplicate) return NextResponse.json({ error: "Slug UMKM sudah digunakan." }, { status: 409 });
  const existingContact = current.publicContact && typeof current.publicContact === "object" && !Array.isArray(current.publicContact) ? current.publicContact as { instagram?: string; profileImage?: string } : {};
  const profileImage = body && "profileImage" in body ? textValue(body.profileImage, 6 * 1024 * 1024) : existingContact.profileImage || "";
  const requestedPublished = body && "isPublished" in body ? Boolean(body.isPublished) : current.isPublished;
  await prisma.umkm.update({ where: { id: params.id }, data: {
    name, slug,
    description: body && "description" in body ? textValue(body.description, 8000) || null : current.description,
    ownerName: body && "ownerName" in body ? textValue(body.ownerName, 160) || null : current.ownerName,
    businessType: body && "businessType" in body ? textValue(body.businessType, 500) || null : current.businessType,
    nib: body && "nib" in body ? textValue(body.nib, 160) || null : current.nib,
    halalPermit: body && "halalPermit" in body ? textValue(body.halalPermit, 160) || null : current.halalPermit,
    sppirt: body && "sppirt" in body ? textValue(body.sppirt, 160) || null : current.sppirt,
    privateAddress: body && "address" in body ? textValue(body.address, 1000) || null : current.privateAddress,
    isPublished: Boolean(requestedPublished && profileImage),
    publicContact: {
      instagram: body && "instagram" in body ? textValue(body.instagram, 160) : existingContact.instagram || "",
      profileImage,
    },
  } });
  await prisma.auditLog.create({ data: { action: "update", entity: "umkm", entityId: params.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom" } } });
  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath("/kategori");
  revalidatePath(`/umkm/${slug}`);
  revalidateTag("public-umkm");
  revalidateTag("public-catalog");
  return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin UMKM profile update failed:", error);
    return NextResponse.json({ error: "Profil belum tersimpan karena server gagal mengakses database. Periksa koneksi database lalu coba lagi." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const current = await prisma.umkm.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!current) return NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });
  await prisma.umkm.update({ where: { id: params.id }, data: { isPublished: false } });
  await prisma.auditLog.create({ data: { action: "deactivate", entity: "umkm", entityId: params.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom" } } });
  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath("/kategori");
  revalidateTag("public-umkm");
  revalidateTag("public-catalog");
  return NextResponse.json({ ok: true });
}
