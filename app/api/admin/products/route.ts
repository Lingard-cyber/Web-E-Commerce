import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";

const productTypes = ["ready_stock", "fresh_preorder", "service"] as const;
const publishStatuses = ["draft", "pending_verification", "published", "archived"] as const;
const bookingModes = ["direct_booking", "quotation"] as const;
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const MAX_SOURCE_LENGTH = 9 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function readBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) return await request.json().catch(() => null) as Record<string, unknown> | null;
  const form = await request.formData();
  const body: Record<string, unknown> = {};
  form.forEach((value, key) => { if (typeof value === "string") body[key] = value; });
  const file = form.get("file");
  if (file && typeof file !== "string") {
    if (!allowedImageTypes.has(file.type)) return { error: "Format foto harus JPG, PNG, WEBP, atau GIF." };
    if (file.size <= 0) return { error: "File foto yang dipilih kosong." };
    if (file.size > MAX_UPLOAD_BYTES) return { error: "Ukuran foto maksimal 6 MB." };
    body.imageUrl = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
  }
  return body;
}

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await readBody(request);
  if (body && "error" in body && typeof body.error === "string") return validationError(body.error);
  const name = textValue(body?.name, 160);
  const slug = slugValue(body?.slug || name);
  const description = textValue(body?.description, 5000) || null;
  const categoryId = textValue(body?.categoryId, 80);
  const umkmId = textValue(body?.umkmId, 80) || null;
  const productType = textValue(body?.productType, 40) as typeof productTypes[number];
  const publishStatus = textValue(body?.publishStatus, 40) as typeof publishStatuses[number];
  if (!name || !slug || !categoryId || !productTypes.includes(productType) || !publishStatuses.includes(publishStatus)) return validationError("Nama, slug, kategori, jenis, dan status publikasi wajib diisi dengan benar.");
  if (productType === "service" && body?.serviceBookingMode && !bookingModes.includes(textValue(body.serviceBookingMode, 40) as typeof bookingModes[number])) return validationError("Mode pemesanan jasa tidak valid.");

  const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "Slug sudah digunakan oleh produk atau jasa lain." }, { status: 409 });
  const [category, umkm] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
    umkmId ? prisma.umkm.findUnique({ where: { id: umkmId }, select: { id: true } }) : null,
  ]);
  if (!category) return validationError("Kategori tidak ditemukan.");
  if (umkmId && !umkm) return validationError("Data UMKM tidak ditemukan.");

  const price = typeof body?.priceIdr === "number" ? body.priceIdr : Number(body?.priceIdr || 0);
  const stock = typeof body?.stockQty === "number" ? body.stockQty : Number(body?.stockQty || 0);
  if (!Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return validationError("Harga dan stok harus berupa angka nol atau lebih.");
  const variantLabel = textValue(body?.variantLabel, 120) || (productType === "service" ? "Konsultasi" : "Varian utama");
  const imageUrl = textValue(body?.imageUrl, MAX_SOURCE_LENGTH);
  const isHero = body?.isHero === true || body?.isHero === "true";
  const serviceBookingMode = productType === "service" ? (textValue(body?.serviceBookingMode, 40) as typeof bookingModes[number] || "quotation") : null;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data: { name, slug, description, categoryId, umkmId, productType, publishStatus, serviceBookingMode, serviceRequirements: productType === "service" ? textValue(body?.serviceRequirements, 3000) || null : null, serviceAvailability: productType === "service" ? textValue(body?.serviceAvailability, 500) || null : null, serviceDuration: productType === "service" ? textValue(body?.serviceDuration, 200) || null : null, variants: { create: { label: variantLabel, priceIdr: productType === "service" && serviceBookingMode === "quotation" && !price ? null : price, stockQty: productType === "service" ? null : stock } }, images: imageUrl ? { create: { imageUrl, isPrimary: true, isHero, altText: name } } : undefined } });
    await tx.auditLog.create({ data: { action: "create", entity: "product", entityId: created.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom", productType } } });
    return created;
  });
  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/jasa");
  revalidatePath("/kategori");
  revalidatePath(`/produk/${slug}`);
  revalidateTag("public-catalog");
  return NextResponse.json({ id: product.id }, { status: 201 });
}
