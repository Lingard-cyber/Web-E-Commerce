import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";

const productTypes = ["ready_stock", "fresh_preorder", "service"] as const;
const publishStatuses = ["draft", "pending_verification", "published", "archived"] as const;
const bookingModes = ["direct_booking", "quotation"] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { admin, response } = await requireAdminApi();
  if (response) return response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
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
  const imageUrl = body && "imageUrl" in body ? textValue(body.imageUrl, 500) : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: params.id }, data: { name, slug, description: body && "description" in body ? textValue(body.description, 5000) || null : current.description, categoryId, umkmId, productType, publishStatus, serviceBookingMode, serviceRequirements: productType === "service" ? textValue(body?.serviceRequirements, 3000) || current.serviceRequirements : null, serviceAvailability: productType === "service" ? textValue(body?.serviceAvailability, 500) || current.serviceAvailability : null, serviceDuration: productType === "service" ? textValue(body?.serviceDuration, 200) || current.serviceDuration : null } });
    const variant = current.variants[0];
    if (variant) await tx.productVariant.update({ where: { id: variant.id }, data: { label: textValue(body?.variantLabel, 120) || variant.label, priceIdr: productType === "service" && serviceBookingMode === "quotation" && !price ? null : price, stockQty: productType === "service" ? null : stock } });
    if (imageUrl !== undefined) {
      const primary = current.images[0];
      if (primary) await tx.productImage.update({ where: { id: primary.id }, data: { imageUrl, altText: name } });
      else if (imageUrl) await tx.productImage.create({ data: { productId: params.id, imageUrl, altText: name, isPrimary: true } });
    }
    if (admin?.databaseUserId) await tx.auditLog.create({ data: { userId: admin.databaseUserId, action: "update", entity: "product", entityId: params.id, metadata: { productType, publishStatus } } });
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { admin, response } = await requireAdminApi();
  if (response) return response;
  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Produk atau jasa tidak ditemukan." }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: params.id }, data: { publishStatus: "archived", variants: { updateMany: { where: {}, data: { isActive: false } } } } });
    if (admin?.databaseUserId) await tx.auditLog.create({ data: { userId: admin.databaseUserId, action: "archive", entity: "product", entityId: params.id } });
  });
  return NextResponse.json({ ok: true });
}
