import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugValue, textValue } from "@/lib/admin-api";
import { catalogEntries } from "@/lib/catalog";

type ImportRow = {
  rowNumber: number;
  ownerName?: unknown;
  businessType?: unknown;
  narrative?: unknown;
  nib?: unknown;
  halalPermit?: unknown;
  sppirt?: unknown;
  ktp?: unknown;
  address?: unknown;
  profileImage?: unknown;
  matchProductSlugs?: unknown;
};

function filledValue(value: unknown, maxLength: number) {
  const clean = textValue(value, maxLength);
  return clean === "-" || clean === "—" ? "" : clean;
}

function categoryFor(type: string) {
  const value = type.toLowerCase();
  if (/jahit|penjahit|permak|taylor/.test(value)) return { slug: "fashion-jasa-jahit", name: "Fashion & jasa jahit" };
  if (/salon|rias|bekam|pijat|servis|service|jasa|percetakan|fotokopi|fotocopy/.test(value)) return { slug: "jasa-layanan", name: "Jasa & layanan" };
  if (/kopi|jahe|wedang|minuman|susu|madu|herbal|jamu/.test(value)) return { slug: "minuman-herbal", name: "Minuman & herbal" };
  if (/rajut|souvenir|kerajinan|hias|anyam|craft/.test(value)) return { slug: "kerajinan-souvenir", name: "Kerajinan & souvenir" };
  if (/makanan|camilan|kerupuk|peyek|keripik|kripik|kue|roti|nasi|sambal|sambel|bakso|sosis|pizza|olahan|snack|stik|sempol|slondok|kuliner|jajan|catering|pang[s]?it|soto|jadah|telur|sayur|es buah/.test(value)) return { slug: "makanan-camilan", name: "Makanan & camilan" };
  if (/batik|kaos|aksesoris|aksesori/.test(value)) return { slug: "kerajinan-souvenir", name: "Kerajinan & souvenir" };
  return { slug: "lainnya", name: "Usaha lainnya" };
}

function typeFor(type: string): "ready_stock" | "fresh_preorder" | "service" {
  return /jahit|penjahit|permak|salon|rias|bekam|pijat|servis|service|jasa|percetakan|fotokopi|fotocopy|taylor/.test(type.toLowerCase()) ? "service" : "ready_stock";
}

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const payload = await request.json().catch(() => null) as { rows?: ImportRow[] } | null;
  if (!Array.isArray(payload?.rows) || payload.rows.length === 0 || payload.rows.length > 100) {
    return NextResponse.json({ error: "Unggah 1 sampai 100 baris data UMKM." }, { status: 400 });
  }

  const rows = payload.rows;
  const summary = { profilesCreated: 0, profilesUpdated: 0, productsCreated: 0, productsLinked: 0, skipped: 0 };
  await prisma.$transaction(async (tx) => {
  for (const row of rows) {
    const rowNumber = Number(row.rowNumber);
    const ownerName = filledValue(row.ownerName, 160);
    const businessType = filledValue(row.businessType, 500);
    if (!Number.isInteger(rowNumber) || rowNumber <= 0 || !ownerName || !businessType) { summary.skipped++; continue; }
    const importKey = `induk-umkm-row-${rowNumber}`;
    const name = ownerName;
    const slug = slugValue(`umkm-${rowNumber}-${ownerName}`);
    const existingProfile = await tx.umkm.findUnique({ where: { importKey }, select: { id: true, publicContact: true } });
    const existingContact = existingProfile?.publicContact && typeof existingProfile.publicContact === "object" && !Array.isArray(existingProfile.publicContact) ? existingProfile.publicContact as { instagram?: string; profileImage?: string } : {};
    const profileImage = filledValue(row.profileImage, 6 * 1024 * 1024) || existingContact.profileImage || "";
    const values = {
      name, slug,
      description: filledValue(row.narrative, 8000) || null,
      ownerName,
      businessType,
      nib: filledValue(row.nib, 160) || null,
      halalPermit: filledValue(row.halalPermit, 160) || null,
      sppirt: filledValue(row.sppirt, 160) || null,
      privateAddress: filledValue(row.address, 1000) || null,
      isPublished: Boolean(profileImage),
      publicContact: { instagram: existingContact.instagram || "", profileImage },
    };
    const profile = await tx.umkm.upsert({ where: { importKey }, create: { ...values, importKey }, update: values });
    if (existingProfile) summary.profilesUpdated++; else summary.profilesCreated++;

    const matchSlugs = Array.isArray(row.matchProductSlugs) ? row.matchProductSlugs.map((value) => textValue(value, 180)).filter(Boolean) : [];
    let linkedCount = 0;
    for (const matchSlug of matchSlugs) {
      const existingProduct = await tx.product.findUnique({ where: { slug: matchSlug }, select: { id: true, images: { select: { imageUrl: true } } } });
      if (!existingProduct) continue;
      const catalogDescription = values.description ? catalogEntries.find((entry) => entry.slug === matchSlug)?.description : undefined;
      const hasPhoto = existingProduct.images.some(({ imageUrl }) => imageUrl.trim() && !/placeholder|no-image/i.test(imageUrl));
      await tx.product.update({ where: { id: existingProduct.id }, data: { umkmId: profile.id, publishStatus: hasPhoto ? "published" : "archived", ...(catalogDescription ? { description: catalogDescription } : {}) } });
      summary.productsLinked++;
      linkedCount++;
    }
    if (linkedCount > 0) continue;

    const categorySpec = categoryFor(businessType);
    const category = await tx.category.upsert({ where: { slug: categorySpec.slug }, create: { ...categorySpec, description: `Produk dan layanan ${categorySpec.name.toLowerCase()} dari UMKM Kepuharjo.` }, update: {} });
    const productType = typeFor(businessType);
    const productSlug = slugValue(`induk-${rowNumber}-${businessType}`);
    const existingImportedProduct = await tx.product.findUnique({ where: { importKey }, select: { id: true, images: { select: { imageUrl: true } } } });
    const hasPhoto = existingImportedProduct?.images.some(({ imageUrl }) => imageUrl.trim() && !/placeholder|no-image/i.test(imageUrl)) ?? false;
    const productData = {
      umkmId: profile.id,
      categoryId: category.id,
      name: businessType,
      slug: productSlug,
      description: values.description,
      productType,
      publishStatus: hasPhoto ? "published" as const : "archived" as const,
      serviceBookingMode: productType === "service" ? "quotation" as const : null,
      verificationNote: "Data awal dari induk UMKM; harga, stok, dan foto belum tersedia.",
    };
    await tx.product.upsert({
      where: { importKey },
      create: { ...productData, importKey, variants: { create: { label: productType === "service" ? "Konsultasi" : "Varian utama", priceIdr: null, stockQty: null } } },
      update: productData,
    });
    if (!existingImportedProduct) summary.productsCreated++;
  }
  await tx.auditLog.create({ data: { action: "import", entity: "umkm-workbook", metadata: { actor: process.env.ADMIN_LOGIN_NAME || "Admin Forkom", ...summary } } });
  }, { maxWait: 10000, timeout: 60000 });
  revalidatePath("/"); revalidatePath("/produk"); revalidatePath("/jasa"); revalidatePath("/umkm");
  revalidateTag("public-umkm"); revalidateTag("public-catalog");
  return NextResponse.json(summary);
}
