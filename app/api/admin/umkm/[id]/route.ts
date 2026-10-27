import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { admin, response } = await requireAdminApi();
  if (response) return response;
  const current = await prisma.umkm.findUnique({ where: { id: params.id }, select: { id: true, name: true, slug: true, description: true, isPublished: true, publicContact: true } });
  if (!current) return NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = textValue(body?.name, 160) || current.name;
  const slug = slugValue(body?.slug || name);
  const duplicate = await prisma.umkm.findFirst({ where: { slug, id: { not: params.id } }, select: { id: true } });
  if (duplicate) return NextResponse.json({ error: "Slug UMKM sudah digunakan." }, { status: 409 });
  const existingContact = current.publicContact && typeof current.publicContact === "object" && !Array.isArray(current.publicContact) ? current.publicContact as { contact?: string; address?: string } : {};
  await prisma.umkm.update({ where: { id: params.id }, data: { name, slug, description: body && "description" in body ? textValue(body.description, 3000) || null : current.description, isPublished: body && "isPublished" in body ? Boolean(body.isPublished) : current.isPublished, publicContact: { contact: body && "contact" in body ? textValue(body.contact, 160) : existingContact.contact || "", address: body && "address" in body ? textValue(body.address, 500) : existingContact.address || "" } } });
  if (admin?.databaseUserId) await prisma.auditLog.create({ data: { userId: admin.databaseUserId, action: "update", entity: "umkm", entityId: params.id } });
  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath("/kategori");
  revalidatePath(`/umkm/${slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { admin, response } = await requireAdminApi();
  if (response) return response;
  const current = await prisma.umkm.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!current) return NextResponse.json({ error: "UMKM tidak ditemukan." }, { status: 404 });
  await prisma.umkm.update({ where: { id: params.id }, data: { isPublished: false } });
  if (admin?.databaseUserId) await prisma.auditLog.create({ data: { userId: admin.databaseUserId, action: "deactivate", entity: "umkm", entityId: params.id } });
  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath("/kategori");
  return NextResponse.json({ ok: true });
}
