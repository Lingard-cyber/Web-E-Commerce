require("dotenv").config({ override: true });
const { PrismaClient } = require("../generated/prisma");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const prisma = new PrismaClient();

// The storefront and database seed share one catalog source to keep names,
// prices, PDF references, and image choices in sync.
function loadCatalog() {
  const filename = path.join(__dirname, "../lib/catalog.ts");
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const catalogModule = new Module(filename, module);
  catalogModule.filename = filename;
  catalogModule.paths = Module._nodeModulePaths(path.dirname(filename));
  catalogModule._compile(compiled.outputText, filename);
  return catalogModule.exports.catalogEntries;
}

const catalogEntries = loadCatalog();
const imageDirectory = path.join(__dirname, "../public/catalog/pdf-source");
const legacyDemoSlugs = [
  "almond-cookies-arga", "cookies-griya-snack", "daisuki-snack-mix", "jahe-instan-merapi",
  "jasa-jahit-masruroh", "kastengel-arga", "katering-rumahan-kepuharjo",
  "keripik-jamur-egi-ds", "keripik-kentang-egi-ds", "keripik-pegagan-egi-ds",
  "nastar-griya-snack", "souvenir-kepuharjo", "susu-pasteurisasi-merapi",
];

// Every supplied image is already present byte-for-byte in public/catalog.
const suppliedPhotos = {
  "donat-bolu-kue-kering-arga": ["/catalog/arga/almond-cookies.jpeg", "/catalog/arga/kastengel.jpeg", "/catalog/arga/cookies-assorted.jpeg", "/catalog/arga/nastar.jpeg"],
  "aneka-kue-kering-griya-snack": ["/catalog/griya-snack/mixed-cookies.jpeg", "/catalog/griya-snack/sesame-cookies.jpeg", "/catalog/griya-snack/snacks-jar.jpeg", "/catalog/griya-snack/nastar.jpeg", "/catalog/griya-snack/green-cookies.jpeg"],
  "apem-merapi": ["/catalog/camilan-alif/stik-kelor.jpeg"],
  "aneka-criping-merapi-bangkit": ["/catalog/egi-ds/keripik-kentang.jpeg", "/catalog/egi-ds/keripik-pegagan.jpeg", "/catalog/egi-ds/keripik-01.jpeg", "/catalog/egi-ds/keripik-02.jpeg", "/catalog/egi-ds/keripik-03.jpeg", "/catalog/egi-ds/keripik-04.jpeg", "/catalog/egi-ds/keripik-05.jpeg", "/catalog/egi-ds/keripik-06.jpeg"],
  "aneka-keripik-egi-ds": ["/catalog/egi-ds/keripik-kentang-pack.jpeg", "/catalog/egi-ds/keripik-jamur.jpeg"],
  "manggleng-pedas-manis": ["/catalog/egi-ds/manggleng.jpeg"],
  "singkong-keju-chicken-katsu-daisuki": ["/catalog/daisuki/daisuki-snack.jpeg"],
  "susu-pasteurisasi-susu-kurma-jogja": ["/catalog/susu/susu-pasteurisasi.jpeg"],
  "onde-onde-ketawa": ["/catalog/onde2-ketawa/onde2-ketawa.jpeg"],
  "stik-kelor-camilan-alif": ["/catalog/camilan-alif/stik-kelor-display.jpeg"],
  "keripik-usus-egi-ds": ["/catalog/egi-ds/keripik-usus.jpeg"],
};

const catalogOwnerNames = {
  "nasi-bakar-enak": "Sutirah",
  "stik-kelor-camilan-alif": "Asih Wulansari",
  "yuni-taylor": "Yuni Astuti",
  "aneka-keripik-egi-ds": "Sunarti",
  "keripik-usus-egi-ds": "Sunarti",
  "manggleng-pedas-manis": "Tri Lesningsih",
  "apem-merapi": "Endar Rahayu",
  "pizza": "Fivin Rakhmawati",
  "rumah-jahit-masruroh": "Siti Masruroh",
  "singkong-keju-chicken-katsu-daisuki": "Siti Masruroh",
  "sambel-bawang-the-ngatmos": "Ika Sulistya Rini",
  "souvenir-ngatmos": "Ika Sulistya Rini",
};

function catalogImages(entry) {
  if (!entry.sourcePdfPage) {
    const urls = suppliedPhotos[entry.slug] || (entry.imageSrc ? [entry.imageSrc] : []);
    return urls.filter((url) => url && fs.existsSync(path.join(__dirname, "../public", url.replace(/^\//, ""))));
  }
  const prefix = `page-${String(entry.sourcePdfPage).padStart(2, "0")}-image-`;
  const files = fs.readdirSync(imageDirectory).filter((filename) => filename.startsWith(prefix)).sort();
  const urls = files.map((filename) => `/catalog/pdf-source/${filename}`);
  const preferred = entry.imageSrc && fs.existsSync(path.join(__dirname, "../public", entry.imageSrc.replace(/^\//, ""))) ? entry.imageSrc : undefined;
  const primary = preferred || urls[0];
  return primary ? [primary] : [];
}

// Kategori ini mengikuti katalog PDF resmi Forkom UMKM Kepuharjo.
const kategoriData = [
  { slug: "makanan-camilan", name: "Makanan & Camilan", description: "Camilan rumahan dan olahan lokal Kepuharjo.", sortOrder: 1 },
  { slug: "minuman-herbal", name: "Minuman & Herbal", description: "Minuman olahan, jahe, madu, susu, dan produk herbal.", sortOrder: 2 },
  { slug: "kerajinan-souvenir", name: "Kerajinan & Souvenir", description: "Kerajinan tangan dan souvenir karya warga Kepuharjo.", sortOrder: 3 },
  { slug: "fashion-jasa-jahit", name: "Fashion & Jasa Jahit", description: "Pakaian, jahit, permak, dan kebutuhan tekstil.", sortOrder: 4 },
];

const galeriData = [
  { src: "/gallery/kegiatan-01.jpeg", alt: "Kegiatan warga Forkom UMKM Kepuharjo di balai desa", title: "Kegiatan bersama warga", sortOrder: 1, isHero: true },
  { src: "/gallery/kegiatan-02.jpeg", alt: "Kunjungan dan interaksi warga di kegiatan UMKM Kepuharjo", title: "Kunjungan UMKM", sortOrder: 2, isHero: true },
  { src: "/gallery/kegiatan-03.jpeg", alt: "Produk UMKM Kepuharjo dalam kegiatan warga", title: "Produk lokal Kepuharjo", sortOrder: 3, isHero: true },
  { src: "/gallery/kegiatan-04.jpeg", alt: "Penyerahan produk UMKM Kepuharjo kepada tamu", title: "Apresiasi produk lokal", sortOrder: 4, isHero: true },
  { src: "/gallery/kegiatan-05.jpeg", alt: "Pelaku UMKM Kepuharjo berfoto bersama di depan sekretariat", title: "Kebersamaan Forkom UMKM", sortOrder: 5, isHero: true },
];

const curatedGallerySources = new Set(galeriData.map((item) => item.src));
const galleryDirectory = path.join(__dirname, "../public/gallery");
const communityGalleryData = fs.readdirSync(galleryDirectory)
  .filter((filename) => /\.(?:jpe?g|png|webp)$/i.test(filename))
  .map((filename) => `/gallery/${filename}`)
  .filter((src) => !curatedGallerySources.has(src))
  .sort()
  .map((src, index) => ({ src, title: "Dokumentasi UMKM Kepuharjo", alt: "Foto kegiatan dan dokumentasi UMKM Kepuharjo.", sortOrder: 6 + index, isHero: false }));

const completeGalleryData = [...galeriData, ...communityGalleryData];

async function main() {
  for (const urls of Object.values(suppliedPhotos)) for (const url of urls) {
    if (!fs.existsSync(path.join(__dirname, "../public", url.slice(1)))) throw new Error(`Foto tidak ditemukan: ${url}`);
  }
  for (const item of completeGalleryData) {
    if (!fs.existsSync(path.join(__dirname, "../public", item.src.slice(1)))) throw new Error(`Foto galeri tidak ditemukan: ${item.src}`);
  }

  // Keluarkan foto katalog produk dari galeri kegiatan.
  await prisma.galleryImage.deleteMany({ where: { src: { startsWith: "/catalog/" } } });
  for (const item of kategoriData) {
    await prisma.category.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  for (const item of completeGalleryData) {
    const existing = await prisma.galleryImage.findFirst({ where: { src: item.src } });
    if (existing) {
      await prisma.galleryImage.update({ where: { id: existing.id }, data: { ...item, isPublished: true, isHero: item.isHero } });
    } else {
      await prisma.galleryImage.create({ data: { ...item, isPublished: true, isHero: item.isHero } });
    }
  }

  // These records were created by the previous demo fixture. The explicit
  // identifiers prevent real orders or accounts from being removed.
  const demoOrders = await prisma.order.findMany({
    where: { publicCode: { startsWith: "KPH-DUMMY-" } },
    select: { id: true, payment: { select: { provider: true } } },
  });
  if (demoOrders.some((order) => order.payment?.provider !== "dummy")) throw new Error("Pesanan bertanda DUMMY memakai pembayaran non-demo; pembersihan dihentikan.");
  const demoOrderIds = demoOrders.map((order) => order.id);
  const demoInquiryWindow = { gte: new Date("2026-10-26T03:59:00.000Z"), lt: new Date("2026-10-26T04:00:00.000Z") };
  const demoInquirySlugs = ["jasa-jahit-masruroh", "souvenir-kepuharjo", "katering-rumahan-kepuharjo"];
  await prisma.$transaction(async (tx) => {
    await tx.paymentEvent.deleteMany({ where: { provider: "dummy" } });
    if (demoOrderIds.length) await tx.order.deleteMany({ where: { id: { in: demoOrderIds } } });
    await tx.serviceInquiry.deleteMany({ where: { createdAt: demoInquiryWindow, product: { slug: { in: demoInquirySlugs } } } });
    const demoUser = await tx.user.findUnique({ where: { email: "demo@kepuharjomarket.test" }, select: { id: true, authId: true } });
    if (demoUser && !demoUser.authId) {
      await tx.auditLog.deleteMany({ where: { userId: demoUser.id } });
      await tx.user.delete({ where: { id: demoUser.id } });
    }
  });

  const categoryIds = new Map((await prisma.category.findMany({ select: { id: true, slug: true } })).map((category) => [category.slug, category.id]));
  let deleted = 0;
  let archived = 0;

  for (const product of await prisma.product.findMany({
    where: { slug: { in: legacyDemoSlugs } },
    select: { id: true, slug: true, _count: { select: { orderItems: true, serviceInquiries: true } } },
  })) {
    await prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({ where: { productId: product.id }, select: { id: true } });
      const variantIds = variants.map((variant) => variant.id);
      if (variantIds.length) await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
      if (product._count.orderItems || product._count.serviceInquiries) {
        await tx.product.update({ where: { id: product.id }, data: { publishStatus: "archived", umkmId: null } });
        if (variantIds.length) await tx.productVariant.updateMany({ where: { id: { in: variantIds } }, data: { isActive: false } });
        archived++;
      } else {
        if (variantIds.length) await tx.stockMovement.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.product.delete({ where: { id: product.id } });
        deleted++;
      }
    });
  }

  for (const entry of catalogEntries) {
    const alreadyImported = await prisma.product.findUnique({
      where: { slug: entry.slug },
      select: { sourceCatalogEntry: true, sourcePdfPage: true, publishStatus: true, _count: { select: { images: true, variants: true } } },
    });
    const imported = entry.sourceCatalogEntry ? alreadyImported?.sourceCatalogEntry === entry.sourceCatalogEntry : alreadyImported?.sourcePdfPage === null;
    const desiredStatus = catalogImages(entry).length ? "published" : "archived";
    if (imported && alreadyImported.publishStatus === desiredStatus && alreadyImported._count.images > 0 && alreadyImported._count.variants >= entry.variants.length) continue;
    const categoryId = categoryIds.get(entry.categorySlug);
    if (!categoryId) throw new Error(`Kategori tidak ditemukan: ${entry.categorySlug}`);
    const ownerName = catalogOwnerNames[entry.slug] || entry.producer;
    let umkm = ownerName ? await prisma.umkm.findFirst({ where: { ownerName }, select: { id: true } }) : null;
    if (!umkm && entry.producer) {
      const producerSlug = entry.producer.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      umkm = await prisma.umkm.upsert({
        where: { slug: producerSlug },
        update: { name: entry.producer, isPublished: true },
        create: { name: entry.producer, slug: producerSlug, isPublished: true },
      });
    }
    const imageUrls = catalogImages(entry);
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { slug: entry.slug },
        update: { name: entry.name, description: entry.description, categoryId, umkmId: umkm?.id || null, productType: entry.productType, publishStatus: imageUrls.length ? "published" : "archived", verificationNote: entry.verificationNote || null, sourcePdfPage: entry.sourcePdfPage || null, sourceCatalogEntry: entry.sourceCatalogEntry || null, serviceBookingMode: entry.productType === "service" ? "quotation" : null },
        create: { slug: entry.slug, name: entry.name, description: entry.description, categoryId, umkmId: umkm?.id || null, productType: entry.productType, publishStatus: imageUrls.length ? "published" : "archived", verificationNote: entry.verificationNote || null, sourcePdfPage: entry.sourcePdfPage || null, sourceCatalogEntry: entry.sourceCatalogEntry || null, serviceBookingMode: entry.productType === "service" ? "quotation" : null },
      });
      const wantedSkus = entry.variants.map((variant) => `catalog-${entry.slug}-${variant.id}`);
      await tx.productVariant.updateMany({ where: { productId: product.id, OR: [{ sku: null }, { sku: { notIn: wantedSkus } }] }, data: { isActive: false } });
      for (const variant of entry.variants) {
        const sku = `catalog-${entry.slug}-${variant.id}`;
        await tx.productVariant.upsert({
          where: { sku },
          update: { label: variant.label, priceIdr: variant.priceIdr, isActive: true, weightGram: null },
          create: { productId: product.id, sku, label: variant.label, priceIdr: variant.priceIdr, stockQty: null, isActive: true },
        });
      }
      const retired = await tx.productVariant.findMany({ where: { productId: product.id, isActive: false, orderItems: { none: {} } }, select: { id: true } });
      if (retired.length) {
        const ids = retired.map((variant) => variant.id);
        await tx.cartItem.deleteMany({ where: { variantId: { in: ids } } });
        await tx.stockMovement.deleteMany({ where: { variantId: { in: ids } } });
        await tx.productVariant.deleteMany({ where: { id: { in: ids } } });
      }
      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (imageUrls.length) await tx.productImage.createMany({ data: imageUrls.map((imageUrl, sortOrder) => ({ productId: product.id, imageUrl, altText: entry.sourcePdfPage ? `${entry.name} - foto katalog halaman ${entry.sourcePdfPage}` : entry.name, sortOrder, isPrimary: sortOrder === 0 })) });
    });
  }

  for (const [slug, urls] of Object.entries(suppliedPhotos)) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true, name: true, images: { select: { imageUrl: true } } } });
    if (!product) throw new Error(`Produk untuk foto tidak ditemukan: ${slug}`);
    const existingUrls = new Set(product.images.map((image) => image.imageUrl));
    const missing = urls.filter((url) => !existingUrls.has(url));
    if (!missing.length) continue;
    await prisma.$transaction(async (tx) => {
      if (missing.includes(urls[0])) await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } });
      await tx.productImage.createMany({ data: missing.map((imageUrl, index) => ({ productId: product.id, imageUrl, altText: product.name, sortOrder: 100 + index, isPrimary: imageUrl === urls[0] })) });
    });
  }

  const legacyUmkmSlugs = ["rumah-jahit-masruroh", "arga-cookies"];
  await prisma.umkm.updateMany({ where: { slug: { in: legacyUmkmSlugs } }, data: { isPublished: false } });
  await prisma.umkm.deleteMany({ where: { slug: { in: legacyUmkmSlugs }, products: { none: {} } } });

  console.log(`Seed selesai: ${catalogEntries.length} entri produk/jasa; 26 foto tambahan dicocokkan; ${deleted} produk contoh dihapus, ${archived} produk lama ber-riwayat diarsipkan.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
