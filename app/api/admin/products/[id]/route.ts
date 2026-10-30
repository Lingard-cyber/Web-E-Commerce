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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await readBody(request);
  if (body && "error" in body && typeof body.error === "string") return validationError(body.error);
  const current = await prisma.product.findUnique({ where: { id: params.id }, include: { variants: { where: { isActive: true }, take: 1 }, images: { where: { isPrimary: true }, take: 1 } } });
  if (!current) return NextResponse.json({ error: "Produk atau jasa tidak ditemukan." }, { status: 404 });
  const name = textValue(body?.name, 160) || current.name;
  const slug = slugValue(body?.slug || name);
  const productType = textValue(body?.productType, 40) as typeof productTypes[number] || current.productType;
  const publishStatus = textValue(body?.publishStatus, 40) as typeof publishStatuses[number] || current.publishStatus;
  if (!productTypes.includes(productType) || !publishStatuses.includes(publishStatus)) return validationError("Jenis atau status publikasi tidak valid.");
  const duplicate = await prisma.product.findFirst({ where: { slug, id: { not: params.id } }, select: { id: true } });
  if (duplicate) return NextResponse.json({ error: "Slug sudah digunakan oleh entri lain." }, { status: 409 });
  const categoryId = textValue(body?.categoryId, 80) || current.categoryId;
  const umkmId = body && "umkmId" in body ? textValue(body.umkmId, 80) || null : current.umkmId;
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) return validationError("Kategori tidak ditemukan.");
  if (umkmId && !(await prisma.umkm.findUnique({ where: { id: umkmId }, select: { id: true } }))) return validationError("Data UMKM tidak ditemukan.");
  const price = body && "priceIdr" in body ? Number(body.priceIdr || 0) : current.variants[0]?.priceIdr ?? 0;
  const stock = body && "stockQty" in body ? Number(body.stockQty || 0) : current.variants[0]?.stockQty ?? 0;
  if (!Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return validationError("Harga dan stok harus berupa angka nol atau lebih.");
  const serviceBookingMode: typeof bookingModes[number] | null = productType === "service" ? (textValue(body?.serviceBookingMode, 40) as typeof bookingModes[number] || current.serviceBookingMode || "quotation") : null;
  if (productType === "service" && (!serviceBookingMode || !bookingModes.includes(serviceBookingMode))) return validationError("Mode pemesanan jasa tidak valid.");
  const imageUrl = body && "imageUrl" in body ? textValue(body.imageUrl, MAX_SOURCE_LENGTH) : undefined;
  const isHero = body && "isHero" in body ? body.isHero === true || body.isHero === "true" : current.images[0]?.isHero ?? false;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: params.id }, data: { name, slug, description: body && "description" in body ? textValue(body.description, 5000) || null : current.description, categoryId, umkmId, productType, publishStatus, serviceBookingMode, serviceRequirements: productType === "service" ? textValue(body?.serviceRequirements, 3000) || current.serviceRequirements : null, serviceAvailability: productType === "service" ? textValue(body?.serviceAvailability, 500) || current.serviceAvailability : null, serviceDuration: productType === "service" ? textValue(body?.serviceDuration, 200) || current.serviceDuration : null } });
    const variant = current.variants[0];
    if (variant) await tx.productVariant.update({ where: { id: variant.id }, data: { label: textValue(body?.variantLabel, 120) || variant.label, priceIdr: productType === "service" && serviceBookingMode === "quotation" && !price ? null : price, stockQty: productType === "service" ? null : stock } });
    if (imageUrl !== undefined) {
      const primary = current.images[0];
      if (primary) await tx.productImage.update({ where: { id: primary.id }, data: { imageUrl, altText: name, isHero } });
      else if (imageUrl) await tx.productImage.create({ data: { productId: params.id, imageUrl, altText: name, isPrimary: true, isHero } });
    } else if (body && "isHero" in body && current.images[0]) {
      await tx.productImage.update({ where: { id: current.images[0].id }, data: { isHero } });
    }
    await tx.auditLog.create({ data: { action: "update", entity: "product", entityId: params.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom", productType, publishStatus } } });
  });
  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/jasa");
  revalidatePath("/kategori");
  revalidatePath(`/produk/${slug}`);
  revalidateTag("public-catalog");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true, slug: true } });
  if (!product) return NextResponse.json({ error: "Produk atau jasa tidak ditemukan." }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: params.id }, data: { publishStatus: "archived", variants: { updateMany: { where: {}, data: { isActive: false } } } } });
    await tx.auditLog.create({ data: { action: "archive", entity: "product", entityId: params.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom" } } });
  });
  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/jasa");
  revalidatePath("/kategori");
  revalidatePath(`/produk/${product.slug}`);
  revalidateTag("public-catalog");
  return NextResponse.json({ ok: true });
}
