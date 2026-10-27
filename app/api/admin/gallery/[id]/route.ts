import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, textValue, validationError } from "@/lib/admin-api";

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_SOURCE_LENGTH = 9 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function imageUrl(value: unknown) {
  const src = textValue(value, MAX_SOURCE_LENGTH);
  return /^(?:\/(?!\/)|https?:\/\/|data:image\/(?:jpeg|png|webp|gif);base64,)/i.test(src) ? src : "";
}

async function readBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) return await request.json().catch(() => null) as Record<string, unknown> | null;

  const form = await request.formData();
  const file = form.get("file");
  let src = imageUrl(form.get("src"));
  if (file && typeof file !== "string") {
    if (!allowedImageTypes.has(file.type)) return { error: "Format foto harus JPG, PNG, WEBP, atau GIF." };
    if (file.size <= 0) return { error: "File foto yang dipilih kosong." };
    if (file.size > MAX_UPLOAD_BYTES) return { error: "Ukuran foto maksimal 6 MB." };
    const content = Buffer.from(await file.arrayBuffer()).toString("base64");
    src = `data:${file.type};base64,${content}`;
  }

  return {
    src,
    title: form.get("title"),
    alt: form.get("alt"),
    sortOrder: form.get("sortOrder"),
    isPublished: form.get("isPublished"),
  } as Record<string, unknown>;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await readBody(request);
  if (body && "error" in body && typeof body.error === "string") return validationError(body.error);
  const src = imageUrl(body?.src);
  const title = textValue(body?.title, 160);
  const alt = textValue(body?.alt, 300);
  if (!src) return validationError("URL foto wajib berupa path lokal atau URL yang valid.");
  if (!title) return validationError("Judul foto wajib diisi.");
  if (!alt) return validationError("Teks alternatif foto wajib diisi.");
  const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Math.max(0, Math.round(Number(body?.sortOrder))) : 0;
  const updated = await prisma.galleryImage.update({ where: { id: params.id }, data: { src, title, alt, sortOrder, isPublished: body?.isPublished !== false && body?.isPublished !== "false" } });
  revalidatePath("/");
  revalidatePath("/galeri");
  return NextResponse.json({ id: updated.id });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  await prisma.galleryImage.delete({ where: { id: params.id } });
  revalidatePath("/");
  revalidatePath("/galeri");
  return NextResponse.json({ ok: true });
}
