import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = textValue(body?.name, 160);
  const slug = slugValue(body?.slug || name);
  if (!name || !slug) return validationError("Nama UMKM wajib diisi.");
  if (await prisma.umkm.findUnique({ where: { slug }, select: { id: true } })) return NextResponse.json({ error: "Slug UMKM sudah digunakan." }, { status: 409 });
  const created = await prisma.umkm.create({ data: { name, slug, description: textValue(body?.description, 3000) || null, isPublished: Boolean(body?.isPublished), publicContact: { contact: textValue(body?.contact, 160), address: textValue(body?.address, 500) } } });
  await prisma.auditLog.create({ data: { action: "create", entity: "umkm", entityId: created.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom" } } });
  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath("/kategori");
  revalidatePath(`/umkm/${created.slug}`);
  revalidateTag("public-umkm");
  revalidateTag("public-catalog");
  return NextResponse.json({ id: created.id }, { status: 201 });
}
