const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const kategoriData = [
  { slug: "makanan-camilan", name: "Makanan & Camilan", description: "Camilan rumahan dan olahan lokal Kepuharjo.", sortOrder: 1 },
  { slug: "minuman-herbal", name: "Minuman & Herbal", description: "Minuman olahan, jahe, madu, dan produk herbal.", sortOrder: 2 },
  { slug: "kerajinan-souvenir", name: "Kerajinan & Souvenir", description: "Kerajinan tangan dan oleh-oleh khas warga.", sortOrder: 3 },
  { slug: "fashion-jasa-jahit", name: "Fashion & Jasa Jahit", description: "Pakaian, jahit, dan kebutuhan tekstil.", sortOrder: 4 },
  { slug: "makanan-siap-saji", name: "Makanan Siap Saji", description: "Hidangan rumahan untuk keluarga, rapat, dan acara.", sortOrder: 5 },
  { slug: "oleh-oleh-kepuharjo", name: "Oleh-oleh Kepuharjo", description: "Produk pilihan untuk buah tangan dari Kepuharjo.", sortOrder: 6 },
  { slug: "kebutuhan-rumah", name: "Kebutuhan Rumah", description: "Produk rumah tangga dan kebutuhan harian warga.", sortOrder: 7 },
  { slug: "jasa-acara", name: "Jasa Acara", description: "Layanan pendukung acara, komunitas, dan keluarga.", sortOrder: 8 },
];

const umkmData = [
  { slug: "egi-ds", name: "EGI DS", description: "Produsen keripik rumahan dengan bahan pilihan dari sekitar Kepuharjo.", publicContact: { whatsapp: "081234567890", instagram: "@egids.kepuharjo", address: "Kepuharjo, Cangkringan" } },
  { slug: "griya-snack", name: "Griya Snack", description: "Aneka kue kering dan camilan untuk keluarga maupun acara.", publicContact: { whatsapp: "081298765432", instagram: "@griyasnack", address: "Kepuharjo, Cangkringan" } },
  { slug: "rumah-jahit-masruroh", name: "Rumah Jahit Masruroh", description: "Jasa jahit dan permak pakaian untuk kebutuhan harian dan acara.", publicContact: { whatsapp: "081212121212", instagram: "@rumahjahit.masruroh", address: "Kepuharjo, Cangkringan" } },
  { slug: "arga-cookies", name: "Arga Cookies", description: "Kue kering rumahan dengan pilihan rasa untuk hantaran dan acara.", publicContact: { whatsapp: "081223344556", instagram: "@argacookies", address: "Pakem, Sleman" } },
  { slug: "camilan-alif", name: "Camilan Alif", description: "Camilan sehat berbahan kelor dan hasil kebun lokal.", publicContact: { whatsapp: "081277788899", instagram: "@camilanalif", address: "Kepuharjo, Cangkringan" } },
  { slug: "daisuki-snack", name: "Daisuki Snack", description: "Snack renyah untuk oleh-oleh dan teman berkumpul.", publicContact: { whatsapp: "081233445566", instagram: "@daisukisnack", address: "Sleman" } },
  { slug: "dapur-kepuharjo", name: "Dapur Kepuharjo", description: "Masakan rumahan dan katering kecil untuk berbagai kebutuhan.", publicContact: { whatsapp: "081255566677", instagram: "@dapur.kepuharjo", address: "Kepuharjo, Cangkringan" } },
  { slug: "susu-merapi-segar", name: "Susu Merapi Segar", description: "Produk susu segar dan olahan susu dari peternak lokal.", publicContact: { whatsapp: "081288899900", instagram: "@susumerapisegar", address: "Cangkringan, Sleman" } },
];

const produkData = [
  { slug: "keripik-jamur-egi-ds", name: "Keripik Jamur EGI DS", type: "ready_stock", category: "makanan-camilan", umkm: "egi-ds", description: "Keripik jamur renyah dengan bumbu gurih.", image: "/catalog/egi-ds/keripik-jamur.jpeg", variants: [{ sku: "DUMMY-EGI-JAMUR-100", label: "100 g", priceIdr: 18000, stockQty: 38, weightGram: 100 }, { sku: "DUMMY-EGI-JAMUR-200", label: "200 g", priceIdr: 30000, stockQty: 24, weightGram: 200 }] },
  { slug: "manggleng-pedas-manis", name: "Manggleng Pedas Manis", type: "ready_stock", category: "makanan-camilan", umkm: "egi-ds", description: "Manggleng renyah dengan rasa pedas manis.", image: "/catalog/egi-ds/manggleng.jpeg", variants: [{ sku: "DUMMY-MANGGLENG-150", label: "150 g", priceIdr: 8000, stockQty: 52, weightGram: 150 }, { sku: "DUMMY-MANGGLENG-250", label: "250 g", priceIdr: 10000, stockQty: 40, weightGram: 250 }] },
  { slug: "keripik-kentang-egi-ds", name: "Keripik Kentang EGI DS", type: "ready_stock", category: "makanan-camilan", umkm: "egi-ds", description: "Keripik kentang tipis dengan tekstur renyah.", image: "/catalog/egi-ds/keripik-kentang.jpeg", variants: [{ sku: "DUMMY-KENTANG-100", label: "100 g", priceIdr: 16000, stockQty: 30, weightGram: 100 }, { sku: "DUMMY-KENTANG-250", label: "250 g", priceIdr: 32000, stockQty: 18, weightGram: 250 }] },
  { slug: "keripik-pegagan-egi-ds", name: "Keripik Pegagan", type: "ready_stock", category: "oleh-oleh-kepuharjo", umkm: "egi-ds", description: "Keripik daun pegagan dengan bumbu gurih khas.", image: "/catalog/egi-ds/keripik-pegagan.jpeg", variants: [{ sku: "DUMMY-PEGAGAN-100", label: "100 g", priceIdr: 17000, stockQty: 26, weightGram: 100 }, { sku: "DUMMY-PEGAGAN-200", label: "200 g", priceIdr: 29000, stockQty: 16, weightGram: 200 }] },
  { slug: "keripik-usus-egi-ds", name: "Keripik Usus Gurih", type: "ready_stock", category: "makanan-camilan", umkm: "egi-ds", description: "Keripik usus berbumbu gurih untuk camilan sehari-hari.", image: "/catalog/egi-ds/keripik-usus.jpeg", variants: [{ sku: "DUMMY-USUS-100", label: "100 g", priceIdr: 15000, stockQty: 34, weightGram: 100 }, { sku: "DUMMY-USUS-250", label: "250 g", priceIdr: 33000, stockQty: 12, weightGram: 250 }] },
  { slug: "cookies-griya-snack", name: "Cookies Griya Snack", type: "ready_stock", category: "makanan-camilan", umkm: "griya-snack", description: "Cookies rumahan untuk teman minum teh.", image: "/catalog/griya-snack/mixed-cookies.jpeg", variants: [{ sku: "DUMMY-COOKIES-250", label: "Toples 250 g", priceIdr: 37000, stockQty: 15, weightGram: 250 }, { sku: "DUMMY-COOKIES-500", label: "Toples 500 g", priceIdr: 68000, stockQty: 9, weightGram: 500 }] },
  { slug: "nastar-griya-snack", name: "Nastar Griya Snack", type: "ready_stock", category: "oleh-oleh-kepuharjo", umkm: "griya-snack", description: "Nastar lembut dengan isian nanas rumahan.", image: "/catalog/griya-snack/nastar.jpeg", variants: [{ sku: "DUMMY-NASTAR-250", label: "Toples 250 g", priceIdr: 42000, stockQty: 14, weightGram: 250 }, { sku: "DUMMY-NASTAR-500", label: "Toples 500 g", priceIdr: 78000, stockQty: 7, weightGram: 500 }] },
  { slug: "kastengel-arga", name: "Kastengel Arga Cookies", type: "ready_stock", category: "oleh-oleh-kepuharjo", umkm: "arga-cookies", description: "Kastengel gurih untuk hantaran dan perayaan.", image: "/catalog/arga/kastengel.jpeg", variants: [{ sku: "DUMMY-KASTENGEL-250", label: "Toples 250 g", priceIdr: 48000, stockQty: 13, weightGram: 250 }, { sku: "DUMMY-KASTENGEL-500", label: "Toples 500 g", priceIdr: 90000, stockQty: 6, weightGram: 500 }] },
  { slug: "almond-cookies-arga", name: "Almond Cookies Arga", type: "ready_stock", category: "makanan-camilan", umkm: "arga-cookies", description: "Cookies almond renyah dengan rasa buttery.", image: "/catalog/arga/almond-cookies.jpeg", variants: [{ sku: "DUMMY-ALMOND-250", label: "Toples 250 g", priceIdr: 50000, stockQty: 11, weightGram: 250 }, { sku: "DUMMY-ALMOND-500", label: "Toples 500 g", priceIdr: 95000, stockQty: 5, weightGram: 500 }] },
  { slug: "stik-kelor-camilan-alif", name: "Stik Kelor Camilan Alif", type: "ready_stock", category: "makanan-camilan", umkm: "camilan-alif", description: "Stik gurih dengan tambahan daun kelor.", image: "/catalog/camilan-alif/stik-kelor.jpeg", variants: [{ sku: "DUMMY-STIK-KELOR-100", label: "100 g", priceIdr: 12000, stockQty: 45, weightGram: 100 }, { sku: "DUMMY-STIK-KELOR-250", label: "250 g", priceIdr: 26000, stockQty: 22, weightGram: 250 }] },
  { slug: "daisuki-snack-mix", name: "Daisuki Snack Mix", type: "ready_stock", category: "makanan-camilan", umkm: "daisuki-snack", description: "Paket snack campur untuk acara dan oleh-oleh.", image: "/catalog/daisuki/daisuki-snack.jpeg", variants: [{ sku: "DUMMY-DAISUKI-250", label: "Paket 250 g", priceIdr: 28000, stockQty: 21, weightGram: 250 }, { sku: "DUMMY-DAISUKI-500", label: "Paket 500 g", priceIdr: 52000, stockQty: 10, weightGram: 500 }] },
  { slug: "onde-onde-ketawa", name: "Onde-onde Ketawa", type: "ready_stock", category: "oleh-oleh-kepuharjo", umkm: null, description: "Onde-onde renyah dengan taburan wijen.", image: "/catalog/onde2-ketawa/onde2-ketawa.jpeg", variants: [{ sku: "DUMMY-ONDE-250", label: "250 g", priceIdr: 22000, stockQty: 25, weightGram: 250 }, { sku: "DUMMY-ONDE-500", label: "500 g", priceIdr: 40000, stockQty: 12, weightGram: 500 }] },
  { slug: "jahe-instan-merapi", name: "Jahe Instan Merapi", type: "ready_stock", category: "minuman-herbal", umkm: null, description: "Minuman jahe instan hangat dari bahan pilihan.", image: "/catalog/pdf-source/page-16-image-01.jpg", variants: [{ sku: "DUMMY-JAHE-225", label: "Pouch 225 g", priceIdr: 25000, stockQty: 30, weightGram: 225 }, { sku: "DUMMY-JAHE-450", label: "Pouch 450 g", priceIdr: 45000, stockQty: 17, weightGram: 450 }] },
  { slug: "susu-pasteurisasi-merapi", name: "Susu Pasteurisasi Merapi", type: "ready_stock", category: "minuman-herbal", umkm: "susu-merapi-segar", description: "Susu pasteurisasi segar untuk konsumsi keluarga.", image: "/catalog/susu/susu-pasteurisasi.jpeg", variants: [{ sku: "DUMMY-SUSU-250", label: "Botol 250 ml", priceIdr: 9000, stockQty: 36, weightGram: 250 }, { sku: "DUMMY-SUSU-1000", label: "Botol 1 liter", priceIdr: 28000, stockQty: 18, weightGram: 1000 }] },
  { slug: "jasa-jahit-masruroh", name: "Jasa Jahit Masruroh", type: "service", category: "fashion-jasa-jahit", umkm: "rumah-jahit-masruroh", description: "Jasa jahit, permak, dan konsultasi ukuran pakaian.", image: "/placeholder-product.svg", serviceBookingMode: "quotation", serviceRequirements: "Jenis pakaian, ukuran, bahan, dan contoh model.", serviceAvailability: "Senin-Sabtu, 08.00-16.00", serviceDuration: "3-7 hari kerja", variants: [{ sku: "DUMMY-JAHIT-KONSULTASI", label: "Konsultasi", priceIdr: null, stockQty: null }] },
  { slug: "souvenir-kepuharjo", name: "Souvenir Kepuharjo", type: "service", category: "kerajinan-souvenir", umkm: null, description: "Pembuatan souvenir sederhana untuk acara komunitas dan keluarga.", image: "/placeholder-product.svg", serviceBookingMode: "quotation", serviceRequirements: "Jumlah, tema, tanggal acara, dan kisaran anggaran.", serviceAvailability: "Menyesuaikan jadwal produksi", serviceDuration: "7-14 hari kerja", variants: [{ sku: "DUMMY-SOUVENIR-KONSULTASI", label: "Konsultasi", priceIdr: null, stockQty: null }] },
  { slug: "katering-rumahan-kepuharjo", name: "Katering Rumahan Kepuharjo", type: "service", category: "makanan-siap-saji", umkm: "dapur-kepuharjo", description: "Katering rumahan untuk rapat, arisan, dan acara keluarga.", image: "/placeholder-product.svg", serviceBookingMode: "quotation", serviceRequirements: "Jumlah porsi, menu, tanggal, dan lokasi pengantaran.", serviceAvailability: "Pemesanan minimal H-3", serviceDuration: "1-2 hari persiapan", variants: [{ sku: "DUMMY-KATERING-KONSULTASI", label: "Konsultasi menu", priceIdr: null, stockQty: null }] },
];

async function upsertProduct(product, categoryId, umkmId) {
  const data = {
    name: product.name,
    description: product.description,
    categoryId,
    umkmId,
    productType: product.type,
    publishStatus: "published",
    verificationNote: "Data dummy untuk pengujian aplikasi.",
    serviceBookingMode: product.serviceBookingMode || null,
    serviceRequirements: product.serviceRequirements || null,
    serviceAvailability: product.serviceAvailability || null,
    serviceDuration: product.serviceDuration || null,
  };
  const existing = await prisma.product.upsert({ where: { slug: product.slug }, update: data, create: { ...data, slug: product.slug } });

  await prisma.productVariant.updateMany({ where: { productId: existing.id }, data: { isActive: false } });
  for (const item of product.variants) {
    await prisma.productVariant.upsert({
      where: { sku: item.sku },
      update: { productId: existing.id, label: item.label, priceIdr: item.priceIdr, stockQty: item.stockQty, weightGram: item.weightGram || null, isActive: true },
      create: { productId: existing.id, sku: item.sku, label: item.label, priceIdr: item.priceIdr, stockQty: item.stockQty, weightGram: item.weightGram || null },
    });
  }

  await prisma.productImage.deleteMany({ where: { productId: existing.id } });
  await prisma.productImage.createMany({ data: [
    { productId: existing.id, imageUrl: product.image, altText: product.name, sortOrder: 0, isPrimary: true },
    { productId: existing.id, imageUrl: product.image, altText: `${product.name} - foto tambahan`, sortOrder: 1, isPrimary: false },
  ] });
  return existing;
}

async function upsertAddress(userId, address) {
  const existing = await prisma.address.findFirst({ where: { userId, label: address.label } });
  if (existing) return prisma.address.update({ where: { id: existing.id }, data: address });
  return prisma.address.create({ data: { userId, ...address } });
}

async function seedOrder({ key, code, userId, address, products, status, paymentStatus, shipmentStatus, courier, trackingNumber, shippingIdr }) {
  const items = products.map(({ product, variant, quantity }) => ({
    productId: product.id,
    variantId: variant.id,
    productName: product.name,
    variantLabel: variant.label,
    quantity,
    unitPriceIdr: variant.priceIdr || 0,
    subtotalIdr: (variant.priceIdr || 0) * quantity,
  }));
  const subtotalIdr = items.reduce((sum, item) => sum + item.subtotalIdr, 0);
  const totalIdr = subtotalIdr + shippingIdr;
  const snapshot = { recipientName: address.recipientName, phone: address.phone, address: address.address, village: address.village, district: address.district, regency: address.regency, postalCode: address.postalCode };

  const order = await prisma.order.upsert({
    where: { idempotencyKey: key },
    update: { publicCode: code, userId, addressId: address.id, status, subtotalIdr, shippingIdr, totalIdr, shippingAddressSnapshot: snapshot },
    create: { publicCode: code, userId, addressId: address.id, status, subtotalIdr, shippingIdr, totalIdr, idempotencyKey: key, shippingAddressSnapshot: snapshot },
  });
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.orderItem.createMany({ data: items.map((item) => ({ ...item, orderId: order.id })) });

  const paidAt = paymentStatus === "paid" ? new Date("2026-10-22T09:00:00+07:00") : null;
  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { provider: "dummy", providerPaymentId: `DUMMY-${code}`, status: paymentStatus, paidAt, rawLastEvent: { source: "seed", status: paymentStatus } },
    create: { orderId: order.id, provider: "dummy", providerPaymentId: `DUMMY-${code}`, status: paymentStatus, paidAt, rawLastEvent: { source: "seed", status: paymentStatus } },
  });
  await prisma.paymentEvent.upsert({
    where: { providerEventId: `DUMMY-EVENT-${code}` },
    update: { paymentId: payment.id, eventType: `payment.${paymentStatus}`, payload: { source: "seed", orderCode: code, status: paymentStatus } },
    create: { provider: "dummy", providerEventId: `DUMMY-EVENT-${code}`, eventType: `payment.${paymentStatus}`, payload: { source: "seed", orderCode: code, status: paymentStatus }, paymentId: payment.id },
  });
  await prisma.shipment.upsert({
    where: { orderId: order.id },
    update: { courier, trackingNumber, status: shipmentStatus, shippedAt: shipmentStatus === "shipped" || shipmentStatus === "delivered" ? new Date("2026-10-22T14:00:00+07:00") : null, deliveredAt: shipmentStatus === "delivered" ? new Date("2026-10-23T15:00:00+07:00") : null },
    create: { orderId: order.id, courier, trackingNumber, status: shipmentStatus, shippedAt: shipmentStatus === "shipped" || shipmentStatus === "delivered" ? new Date("2026-10-22T14:00:00+07:00") : null, deliveredAt: shipmentStatus === "delivered" ? new Date("2026-10-23T15:00:00+07:00") : null },
  });
  return order;
}

async function main() {
  const kategori = {};
  for (const item of kategoriData) kategori[item.slug] = await prisma.category.upsert({ where: { slug: item.slug }, update: item, create: item });

  const umkm = {};
  for (const item of umkmData) umkm[item.slug] = await prisma.umkm.upsert({ where: { slug: item.slug }, update: { ...item, isPublished: true }, create: { ...item, isPublished: true } });

  const produk = {};
  for (const [index, item] of produkData.entries()) {
    produk[item.slug] = await upsertProduct(item, kategori[item.category].id, item.umkm ? umkm[item.umkm].id : null);
    await prisma.product.update({ where: { id: produk[item.slug].id }, data: { sourcePdfPage: 10 + index, sourceCatalogEntry: index + 1 } });
  }

  // Satu user demo dipertahankan agar seed tidak membuat banyak akun pengguna.
  const pengguna = await prisma.user.upsert({
    where: { email: "demo@kepuharjomarket.test" },
    update: { name: "Pelanggan Demo", phone: "081234567891", role: "customer" },
    create: { email: "demo@kepuharjomarket.test", name: "Pelanggan Demo", phone: "081234567891", role: "customer" },
  });
  const alamatRumah = await upsertAddress(pengguna.id, { label: "Rumah Demo", recipientName: "Pelanggan Demo", phone: "081234567891", address: "Jl. Kaliurang Km 20, Kepuharjo", village: "Kepuharjo", district: "Cangkringan", regency: "Sleman", postalCode: "55583", isDefault: true });
  const alamatKantor = await upsertAddress(pengguna.id, { label: "Kantor Demo", recipientName: "Pelanggan Demo", phone: "081234567891", address: "Jl. Pakem-Turi No. 12", village: "Wukirsari", district: "Cangkringan", regency: "Sleman", postalCode: "55584", isDefault: false });
  const alamatKeluarga = await upsertAddress(pengguna.id, { label: "Keluarga Demo", recipientName: "Keluarga Pelanggan", phone: "081234567892", address: "Dusun Kaliadem, Kepuharjo", village: "Kepuharjo", district: "Cangkringan", regency: "Sleman", postalCode: "55583", isDefault: false });

  const variant = (sku) => prisma.productVariant.findUniqueOrThrow({ where: { sku } });
  const orderProducts = async (...lines) => Promise.all(lines.map(async ({ slug, sku, quantity }) => ({ product: produk[slug], variant: await variant(sku), quantity })));
  const orderDefinitions = [
    { key: "seed-demo-order-001", code: "KPH-DUMMY-0001", address: alamatRumah, status: "completed", paymentStatus: "paid", shipmentStatus: "delivered", courier: "JNE", trackingNumber: "JNE-DUMMY-0001", shippingIdr: 10000, lines: [{ slug: "keripik-jamur-egi-ds", sku: "DUMMY-EGI-JAMUR-200", quantity: 2 }, { slug: "manggleng-pedas-manis", sku: "DUMMY-MANGGLENG-250", quantity: 1 }] },
    { key: "seed-demo-order-002", code: "KPH-DUMMY-0002", address: alamatKantor, status: "shipped", paymentStatus: "paid", shipmentStatus: "shipped", courier: "SiCepat", trackingNumber: "SCP-DUMMY-0002", shippingIdr: 12000, lines: [{ slug: "cookies-griya-snack", sku: "DUMMY-COOKIES-250", quantity: 1 }, { slug: "nastar-griya-snack", sku: "DUMMY-NASTAR-250", quantity: 1 }] },
    { key: "seed-demo-order-003", code: "KPH-DUMMY-0003", address: alamatRumah, status: "processing", paymentStatus: "paid", shipmentStatus: "packed", courier: "JNE", trackingNumber: null, shippingIdr: 9000, lines: [{ slug: "susu-pasteurisasi-merapi", sku: "DUMMY-SUSU-1000", quantity: 2 }] },
    { key: "seed-demo-order-004", code: "KPH-DUMMY-0004", address: alamatKeluarga, status: "paid", paymentStatus: "paid", shipmentStatus: "pending", courier: null, trackingNumber: null, shippingIdr: 8000, lines: [{ slug: "stik-kelor-camilan-alif", sku: "DUMMY-STIK-KELOR-250", quantity: 2 }, { slug: "onde-onde-ketawa", sku: "DUMMY-ONDE-250", quantity: 2 }] },
    { key: "seed-demo-order-005", code: "KPH-DUMMY-0005", address: alamatKantor, status: "pending_payment", paymentStatus: "pending", shipmentStatus: "pending", courier: null, trackingNumber: null, shippingIdr: 10000, lines: [{ slug: "jahe-instan-merapi", sku: "DUMMY-JAHE-225", quantity: 1 }, { slug: "keripik-pegagan-egi-ds", sku: "DUMMY-PEGAGAN-100", quantity: 1 }] },
    { key: "seed-demo-order-006", code: "KPH-DUMMY-0006", address: alamatRumah, status: "cancelled", paymentStatus: "failed", shipmentStatus: "returned", courier: "J&T", trackingNumber: "JNT-DUMMY-0006", shippingIdr: 10000, lines: [{ slug: "almond-cookies-arga", sku: "DUMMY-ALMOND-250", quantity: 1 }] },
    { key: "seed-demo-order-007", code: "KPH-DUMMY-0007", address: alamatKeluarga, status: "completed", paymentStatus: "paid", shipmentStatus: "delivered", courier: "AnterAja", trackingNumber: "AA-DUMMY-0007", shippingIdr: 11000, lines: [{ slug: "keripik-kentang-egi-ds", sku: "DUMMY-KENTANG-250", quantity: 1 }, { slug: "daisuki-snack-mix", sku: "DUMMY-DAISUKI-500", quantity: 1 }] },
    { key: "seed-demo-order-008", code: "KPH-DUMMY-0008", address: alamatKantor, status: "expired", paymentStatus: "expired", shipmentStatus: "returned", courier: null, trackingNumber: null, shippingIdr: 9000, lines: [{ slug: "keripik-usus-egi-ds", sku: "DUMMY-USUS-100", quantity: 1 }] },
  ];
  const orders = [];
  for (const definition of orderDefinitions) orders.push(await seedOrder({ ...definition, userId: pengguna.id, products: await orderProducts(...definition.lines) }));

  const cart = await prisma.cart.upsert({ where: { userId: pengguna.id }, update: {}, create: { userId: pengguna.id } });
  for (const [sku, quantity] of [["DUMMY-MANGGLENG-250", 2], ["DUMMY-COOKIES-250", 1], ["DUMMY-JAHE-225", 1], ["DUMMY-STIK-KELOR-100", 3]]) {
    const cartVariant = await variant(sku);
    await prisma.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: cartVariant.id } }, update: { quantity }, create: { cartId: cart.id, variantId: cartVariant.id, quantity } });
  }

  for (const item of produkData.flatMap((item) => item.variants)) {
    if (item.stockQty === null) continue;
    const existingVariant = await prisma.productVariant.findUnique({ where: { sku: item.sku }, select: { id: true } });
    if (!existingVariant) continue;
    for (const [suffix, quantity, reason] of [["opening", item.stockQty, "seed_dummy_opening"], ["restock", Math.ceil(item.stockQty / 2), "seed_dummy_restock"]]) {
      await prisma.stockMovement.upsert({ where: { id: `seed-stock-${item.sku}-${suffix}` }, update: { variantId: existingVariant.id, quantity, reason, referenceId: `seed-stock-${item.sku}-${suffix}` }, create: { id: `seed-stock-${item.sku}-${suffix}`, variantId: existingVariant.id, quantity, reason, referenceId: `seed-stock-${item.sku}-${suffix}` } });
    }
  }

  const inquiryData = [
    ["seed-inquiry-001", "jasa-jahit-masruroh", pengguna.id, "Rina Demo", "081299998888", "Saya ingin permak dua kemeja untuk acara minggu depan.", "new"],
    ["seed-inquiry-002", "souvenir-kepuharjo", null, "Budi Santoso", "081211112222", "Mohon penawaran 50 souvenir untuk acara keluarga.", "contacted"],
    ["seed-inquiry-003", "katering-rumahan-kepuharjo", pengguna.id, "Pelanggan Demo", "081234567891", "Membutuhkan katering makan siang untuk 30 orang.", "quoted"],
    ["seed-inquiry-004", "jasa-jahit-masruroh", null, "Sari Wulandari", "081233334444", "Ingin membuat seragam sederhana untuk komunitas.", "completed"],
    ["seed-inquiry-005", "souvenir-kepuharjo", null, "Andi Pratama", "081255556666", "Minta rekomendasi souvenir dengan anggaran terbatas.", "new"],
    ["seed-inquiry-006", "katering-rumahan-kepuharjo", pengguna.id, "Pelanggan Demo", "081234567891", "Tanya menu nasi kotak untuk rapat kantor.", "cancelled"],
  ];
  for (const [id, slug, userId, name, contact, message, status] of inquiryData) {
    await prisma.serviceInquiry.upsert({ where: { id }, update: { productId: produk[slug].id, userId, name, contact, message, status }, create: { id, productId: produk[slug].id, userId, name, contact, message, status } });
  }

  const siteContents = [
    ["beranda_pengumuman", { title: "Selamat datang di Kepuharjo Market", body: "Data ini adalah data dummy untuk pengujian frontend dan dashboard." }, true],
    ["beranda_hero", { title: "Belanja produk lokal Kepuharjo", body: "Temukan produk dan layanan warga dalam satu tempat." }, true],
    ["tentang_sambutan", { title: "Sambutan Pengelola", body: "Kepuharjo Market menjadi ruang digital untuk memperkenalkan UMKM lokal." }, true],
    ["kontak_whatsapp", { number: "081234567890", label: "Admin Kepuharjo Market" }, true],
    ["kebijakan_pengiriman", { body: "Pengiriman diproses sesuai ketersediaan produk dan kesepakatan dengan pelanggan." }, true],
    ["kebijakan_pembayaran", { body: "Pembayaran produksi belum diaktifkan; data transaksi pada seed adalah dummy." }, false],
    ["faq_pesanan", { items: ["Bagaimana cara memesan?", "Bagaimana melacak pesanan?", "Bagaimana menghubungi UMKM?"] }, true],
    ["footer_social", { instagram: "@kepuharjomarket", facebook: "Kepuharjo Market" }, true],
  ];
  for (const [key, value, isPublished] of siteContents) await prisma.siteContent.upsert({ where: { key }, update: { value, isPublished }, create: { key, value, isPublished } });

  const auditRows = [
    ["seed-audit-001", "seed_dummy", "produk", produk["keripik-jamur-egi-ds"].id, { source: "prisma/seed.js", note: "Data dummy produk" }],
    ["seed-audit-002", "seed_dummy", "produk", produk["jasa-jahit-masruroh"].id, { source: "prisma/seed.js", note: "Data dummy jasa" }],
    ["seed-audit-003", "seed_dummy", "umkm", umkm["egi-ds"].id, { source: "prisma/seed.js", note: "Data dummy UMKM" }],
    ["seed-audit-004", "seed_dummy", "pesanan", orders[0].id, { source: "prisma/seed.js", note: "Data dummy pesanan" }],
    ["seed-audit-005", "seed_dummy", "pesanan", orders[1].id, { source: "prisma/seed.js", note: "Data dummy pesanan" }],
    ["seed-audit-006", "seed_dummy", "pembayaran", orders[2].id, { source: "prisma/seed.js", note: "Data dummy pembayaran" }],
    ["seed-audit-007", "seed_dummy", "permintaan_jasa", "seed-inquiry-001", { source: "prisma/seed.js", note: "Data dummy inquiry" }],
    ["seed-audit-008", "seed_dummy", "konten_situs", null, { source: "prisma/seed.js", note: "Data dummy konten situs" }],
  ];
  for (const [id, action, entity, entityId, metadata] of auditRows) await prisma.auditLog.upsert({ where: { id }, update: { userId: pengguna.id, action, entity, entityId, metadata }, create: { id, userId: pengguna.id, action, entity, entityId, metadata } });

  console.log(`Seed selesai: ${kategoriData.length} kategori, ${umkmData.length} UMKM, ${produkData.length} produk/jasa, 1 pengguna demo, ${orders.length} pesanan, 3 alamat, 1 keranjang, varian, gambar, stok, pembayaran, pengiriman, inquiry jasa, konten situs, dan audit log.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
