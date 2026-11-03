import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";
import { MAX_PRODUCT_IMAGES, readProductBody, type UploadedProductImage } from "@/lib/admin-product-images";

const productTypes = ["ready_stock", "fresh_preorder", "service"] as const;
const publishStatuses = ["draft", "pending_verification", "published", "archived"] as const;
const bookingModes = ["direct_booking", "quotation"] as const;
const MAX_SOURCE_LENGTH = 9 * 1024 * 1024;

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await readProductBody(request);
  if (body instanceof NextResponse) return body;
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
  const imageFiles = Array.isArray(body?.imageFiles) ? body.imageFiles as UploadedProductImage[] : [];
  const images = [...imageFiles, ...(imageUrl ? [{ key: "legacy", imageUrl, isHero }] : [])];
  if (images.length > MAX_PRODUCT_IMAGES) return validationError(`Maksimal ${MAX_PRODUCT_IMAGES} foto per entri.`);
  const primaryImageKey = textValue(body?.primaryImageKey, 120);
  const selectedPrimaryImageKey = images.some((image) => image.key === primaryImageKey) ? primaryImageKey : images[0]?.key || "";
  const serviceBookingMode = productType === "service" ? (textValue(body?.serviceBookingMode, 40) as typeof bookingModes[number] || "quotation") : null;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data: { name, slug, description, categoryId, umkmId, productType, publishStatus, serviceBookingMode, serviceRequirements: productType === "service" ? textValue(body?.serviceRequirements, 3000) || null : null, serviceAvailability: productType === "service" ? textValue(body?.serviceAvailability, 500) || null : null, serviceDuration: productType === "service" ? textValue(body?.serviceDuration, 200) || null : null, variants: { create: { label: variantLabel, priceIdr: productType === "service" && serviceBookingMode === "quotation" && !price ? null : price, stockQty: productType === "service" ? null : stock } }, images: images.length ? { create: images.map((image, index) => ({ imageUrl: image.imageUrl, isPrimary: selectedPrimaryImageKey === image.key, isHero: image.isHero, altText: name, sortOrder: index })) } : undefined } });
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
