import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue, validationError } from "@/lib/admin-api";
import { MAX_PRODUCT_IMAGES, readProductBody, readStringList, type UploadedProductImage } from "@/lib/admin-product-images";

const productTypes = ["ready_stock", "fresh_preorder", "service"] as const;
const publishStatuses = ["draft", "pending_verification", "published", "archived"] as const;
const bookingModes = ["direct_booking", "quotation"] as const;
const MAX_SOURCE_LENGTH = 9 * 1024 * 1024;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Produk atau jasa tidak ditemukan." }, { status: 404 });
  const images = await prisma.productImage.findMany({ where: { productId: params.id }, orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], select: { id: true, imageUrl: true, altText: true, isPrimary: true, isHero: true } });
  return NextResponse.json({ images });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const body = await readProductBody(request);
  if (body instanceof NextResponse) return body;
  if (body && "error" in body && typeof body.error === "string") return validationError(body.error);
  const current = await prisma.product.findUnique({ where: { id: params.id }, include: { variants: { where: { isActive: true }, take: 1 }, images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } } });
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
  if (body && Object.keys(body).length === 1 && "categoryId" in body) {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: params.id }, data: { categoryId } });
      await tx.auditLog.create({ data: { action: "update", entity: "product", entityId: params.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom", productType: current.productType, categoryId } } });
    });
    revalidatePath("/");
    revalidatePath("/produk");
    revalidatePath("/jasa");
    revalidatePath("/kategori");
    revalidateTag("public-catalog");
    return NextResponse.json({ ok: true });
  }
  if (umkmId && !(await prisma.umkm.findUnique({ where: { id: umkmId }, select: { id: true } }))) return validationError("Data UMKM tidak ditemukan.");
  const price = body && "priceIdr" in body ? Number(body.priceIdr || 0) : current.variants[0]?.priceIdr ?? 0;
  const stock = body && "stockQty" in body ? Number(body.stockQty || 0) : current.variants[0]?.stockQty ?? 0;
  if (!Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return validationError("Harga dan stok harus berupa angka nol atau lebih.");
  const serviceBookingMode: typeof bookingModes[number] | null = productType === "service" ? (textValue(body?.serviceBookingMode, 40) as typeof bookingModes[number] || current.serviceBookingMode || "quotation") : null;
  if (productType === "service" && (!serviceBookingMode || !bookingModes.includes(serviceBookingMode))) return validationError("Mode pemesanan jasa tidak valid.");
  const imageUrl = body && "imageUrl" in body ? textValue(body.imageUrl, MAX_SOURCE_LENGTH) : undefined;
  const uploadedImages = Array.isArray(body?.imageFiles) ? body.imageFiles as UploadedProductImage[] : [];
  const imageCollectionRequested = Boolean(body && ("existingImageIds" in body || "imageFiles" in body));
  const existingImageIds = readStringList(body?.existingImageIds);
  const heroImageIds = new Set(readStringList(body?.heroImageIds));
  const primaryImageKey = textValue(body?.primaryImageKey, 120);
  const legacyIsHero = body && "isHero" in body ? body.isHero === true || body.isHero === "true" : false;
  if (imageCollectionRequested) {
    if (existingImageIds.some((id) => !current.images.some((image) => image.id === id))) return validationError("Daftar foto yang dipilih tidak sesuai dengan entri ini.");
    if (existingImageIds.length + uploadedImages.length + (imageUrl ? 1 : 0) > MAX_PRODUCT_IMAGES) return validationError(`Maksimal ${MAX_PRODUCT_IMAGES} foto per entri.`);
  }
  const requestedPrimaryExists = existingImageIds.includes(primaryImageKey) || uploadedImages.some((image) => image.key === primaryImageKey);
  const fallbackPrimaryKey = current.images.find((image) => existingImageIds.includes(image.id))?.id || uploadedImages[0]?.key || "";
  const selectedPrimaryKey = requestedPrimaryExists ? primaryImageKey : fallbackPrimaryKey;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: params.id }, data: { name, slug, description: body && "description" in body ? textValue(body.description, 5000) || null : current.description, categoryId, umkmId, productType, publishStatus, serviceBookingMode, serviceRequirements: productType === "service" ? textValue(body?.serviceRequirements, 3000) || current.serviceRequirements : null, serviceAvailability: productType === "service" ? textValue(body?.serviceAvailability, 500) || current.serviceAvailability : null, serviceDuration: productType === "service" ? textValue(body?.serviceDuration, 200) || current.serviceDuration : null } });
    const variant = current.variants[0];
    if (variant) await tx.productVariant.update({ where: { id: variant.id }, data: { label: textValue(body?.variantLabel, 120) || variant.label, priceIdr: productType === "service" && serviceBookingMode === "quotation" && !price ? null : price, stockQty: productType === "service" ? null : stock } });
    if (imageCollectionRequested) {
      const legacyImages = imageUrl ? [{ key: "legacy", imageUrl, isHero: legacyIsHero }] : [];
      const newImages = [...uploadedImages, ...legacyImages];
      const keptImages = current.images.filter((image) => existingImageIds.includes(image.id));
      if (existingImageIds.length) await tx.productImage.deleteMany({ where: { productId: params.id, id: { notIn: existingImageIds } } });
      else await tx.productImage.deleteMany({ where: { productId: params.id } });
      for (const image of keptImages) {
        await tx.productImage.update({ where: { id: image.id }, data: { isPrimary: selectedPrimaryKey === image.id, isHero: heroImageIds.has(image.id), altText: image.altText || name } });
      }
      for (const [index, image] of newImages.entries()) {
        await tx.productImage.create({ data: { productId: params.id, imageUrl: image.imageUrl, altText: name, isPrimary: selectedPrimaryKey === image.key, isHero: image.isHero, sortOrder: keptImages.length + index } });
      }
    } else if (imageUrl !== undefined) {
      const primary = current.images.find((image) => image.isPrimary) || current.images[0];
      if (primary) await tx.productImage.update({ where: { id: primary.id }, data: { imageUrl, altText: name, isHero: legacyIsHero } });
      else if (imageUrl) await tx.productImage.create({ data: { productId: params.id, imageUrl, isPrimary: true, isHero: legacyIsHero, altText: name } });
    } else if (body && "isHero" in body && current.images.length) {
      const primary = current.images.find((image) => image.isPrimary) || current.images[0];
      await tx.productImage.update({ where: { id: primary.id }, data: { isHero: legacyIsHero } });
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const permanent = new URL(request.url).searchParams.get("permanent") === "true";
  let product;
  try {
    product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: { select: { orderItems: true, serviceInquiries: true } },
        variants: { select: { id: true, _count: { select: { cartItems: true, stockMovements: true } } } },
      },
    });
  } catch {
    return NextResponse.json({ error: "Database gagal memproses penghapusan. Coba lagi setelah koneksi database pulih." }, { status: 503 });
  }
  if (!product) return NextResponse.json({ error: "Produk atau jasa tidak ditemukan." }, { status: 404 });
  if (permanent) {
    if (product._count.orderItems > 0) return NextResponse.json({ error: "Entri memiliki riwayat pesanan sehingga tidak dapat dihapus permanen. Arsipkan entri untuk menyembunyikannya dari katalog." }, { status: 409 });
    if (product._count.serviceInquiries > 0) return NextResponse.json({ error: "Entri memiliki riwayat permintaan jasa sehingga tidak dapat dihapus permanen. Arsipkan entri agar riwayat pelanggan tetap tersimpan." }, { status: 409 });
    try {
      await prisma.$transaction(async (tx) => {
        const variantIds = product.variants.map((variant) => variant.id);
        if (variantIds.length) {
          await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
          await tx.stockMovement.deleteMany({ where: { variantId: { in: variantIds } } });
        }
        await tx.product.delete({ where: { id: params.id } });
        await tx.auditLog.create({ data: { action: "delete", entity: "product", entityId: params.id, metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom", name: product.name, slug: product.slug } } });
      });
    } catch {
      return NextResponse.json({ error: "Penghapusan gagal karena masih ada data terkait. Muat ulang halaman dan coba lagi; jika masih gagal, arsipkan entri agar tidak tampil di katalog." }, { status: 409 });
    }
    revalidatePath("/");
    revalidatePath("/produk");
    revalidatePath("/jasa");
    revalidatePath("/kategori");
    revalidatePath(`/produk/${product.slug}`);
    revalidateTag("public-catalog");
    return NextResponse.json({ ok: true, deleted: true });
  }
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
