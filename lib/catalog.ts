export type ProductType = "ready_stock" | "fresh_preorder" | "service";
export type CatalogStatus = "draft" | "pending_verification" | "published";

export type ProductVariant = {
  id: string;
  label: string;
  priceIdr: number | null;
  stockQty: number | null;
  active: boolean;
};

export type CatalogEntry = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  productType: ProductType;
  description: string;
  variants: ProductVariant[];
  sourcePdfPage: number;
  sourceCatalogEntry: number;
  status: CatalogStatus;
  verificationNote?: string;
  imageAlt: string;
};

const pending = "Data katalog menunggu verifikasi harga, stok, foto, dan izin tayang admin Forkom.";

const variant = (id: string, label: string, priceIdr: number | null): ProductVariant => ({
  id,
  label,
  priceIdr,
  stockQty: null,
  active: true,
});

export const categories = [
  { slug: "makanan-camilan", name: "Makanan & camilan", count: 10, description: "Apem, criping, keripik, sambal, dan olahan siap saji." },
  { slug: "minuman-herbal", name: "Minuman & herbal", count: 8, description: "Kopi, jahe, madu, susu, dan minuman olahan warga." },
  { slug: "kerajinan-souvenir", name: "Kerajinan & souvenir", count: 3, description: "Souvenir, tas rajut, dan dekorasi dari potensi lokal." },
  { slug: "fashion-jasa-jahit", name: "Fashion & jasa jahit", count: 2, description: "Rumah Jahit Masruroh dan Yuni Taylor." },
] as const;

export const catalogEntries: CatalogEntry[] = [
  { id: "cat-01", slug: "apem-merapi", name: "Apem Merapi", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "fresh_preorder", description: "Apem Merapi dari katalog produk Forkom UMKM Kepuharjo.", variants: [variant("apem-satuan", "Apem Merapi", 1500)], sourcePdfPage: 5, sourceCatalogEntry: 1, status: "pending_verification", verificationNote: "Satuan produk perlu dikonfirmasi.", imageAlt: "Foto produk Apem Merapi belum tersedia" },
  { id: "cat-02", slug: "aneka-criping-merapi-bangkit", name: "Aneka Criping Merapi Bangkit Desa Prima", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "ready_stock", description: "Aneka criping talas, pisang, pegagan, jamur, dan kentang.", variants: [variant("criping-talas-300g", "Talas 300 g", 25000), variant("criping-pisang-300g", "Pisang 300 g", 25000), variant("criping-pegagan-300g", "Pegagan 300 g", 25000), variant("criping-jamur-300g", "Jamur 300 g", 45000), variant("criping-kentang-300g", "Kentang 300 g", 45000)], sourcePdfPage: 6, sourceCatalogEntry: 2, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk criping belum tersedia" },
  { id: "cat-03", slug: "aneka-keripik-egi-ds", name: "Aneka Keripik EGI DS", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "ready_stock", description: "Keripik kentang dan jamur dalam beberapa ukuran kemasan.", variants: [variant("keripik-kentang-90g", "Kentang 90 g", 15000), variant("keripik-kentang-250g", "Kentang 250 g", 37000), variant("keripik-jamur-40g", "Jamur 40 g", 6000), variant("keripik-jamur-200g", "Jamur 200 g", 30000), variant("keripik-jamur-250g", "Jamur 250 g", 36000), variant("keripik-jamur-500g", "Jamur 500 g", 70000)], sourcePdfPage: 7, sourceCatalogEntry: 3, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk keripik belum tersedia" },
  { id: "cat-04", slug: "manggleng-pedas-manis", name: "Manggleng Pedas Manis", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "ready_stock", description: "Manggleng dengan pilihan ukuran kemasan.", variants: [variant("manggleng-250g", "250 g", 10000), variant("manggleng-500g", "500 g", 20000), variant("manggleng-1kg", "1 kg", 40000)], sourcePdfPage: 8, sourceCatalogEntry: 4, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk manggleng belum tersedia" },
  { id: "cat-05", slug: "ceker-pedas-manis", name: "Ceker Pedas Manis", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "fresh_preorder", description: "Ceker pedas manis kemasan 350 g.", variants: [variant("ceker-350g", "350 g", 10000)], sourcePdfPage: 9, sourceCatalogEntry: 5, status: "pending_verification", verificationNote: "Klasifikasi segar dan aturan pengiriman perlu dikonfirmasi.", imageAlt: "Foto produk ceker pedas manis belum tersedia" },
  { id: "cat-06", slug: "donat-bolu-kue-kering-arga", name: "Donat, Bolu dan Kue Kering Arga", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "fresh_preorder", description: "Donat, bolu, kue ulang tahun, dan kue kering Arga.", variants: [variant("donat-isi-6", "Donat isi 6", 18000), variant("donat-isi-12", "Donat isi 12", 35000), variant("bolu", "Bolu", 30000), variant("kue-ulang-tahun", "Kue ulang tahun", null), variant("kue-kering-250g", "Kue kering toples 250 g", 37000)], sourcePdfPage: 10, sourceCatalogEntry: 6, status: "pending_verification", verificationNote: "Kue ulang tahun harus melalui penawaran harga.", imageAlt: "Foto produk Donat Bolu Arga belum tersedia" },
  { id: "cat-07", slug: "singkong-keju-chicken-katsu-daisuki", name: "Singkong Keju dan Chicken Katsu Daisuki", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "fresh_preorder", description: "Singkong keju frozen dan chicken katsu.", variants: [variant("singkong-800g", "Singkong keju frozen 800 g", 13000), variant("singkong-1000g", "Singkong keju frozen 1.000 g", 16000), variant("chicken-katsu-200g", "Chicken katsu 200 g", 17000)], sourcePdfPage: 11, sourceCatalogEntry: 7, status: "pending_verification", verificationNote: "Rantai dingin dan area pengiriman perlu disepakati.", imageAlt: "Foto produk Daisuki belum tersedia" },
  { id: "cat-08", slug: "nasi-bakar-enak", name: "Nasi Bakar Enak", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "fresh_preorder", description: "Nasi bakar ayam jamur dan sambal teri.", variants: [variant("nasi-ayam-jamur", "Nasi bakar ayam jamur", 4000), variant("nasi-sambal-teri", "Nasi bakar sambal teri", 4000)], sourcePdfPage: 12, sourceCatalogEntry: 8, status: "pending_verification", verificationNote: "Pre-order dan area pengiriman perlu ditentukan.", imageAlt: "Foto produk Nasi Bakar Enak belum tersedia" },
  { id: "cat-09", slug: "pizza", name: "Pizza", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "fresh_preorder", description: "Pizza mini, sedang, dan besar.", variants: [variant("pizza-mini", "Mini", 2500), variant("pizza-sedang", "Sedang", 5000), variant("pizza-besar", "Besar", 25000)], sourcePdfPage: 13, sourceCatalogEntry: 9, status: "pending_verification", verificationNote: "Aturan produk segar perlu ditentukan.", imageAlt: "Foto produk pizza belum tersedia" },
  { id: "cat-10", slug: "sambel-bawang-the-ngatmos", name: "Sambel Bawang The Ngatmo’s", category: "Makanan & camilan", categorySlug: "makanan-camilan", productType: "ready_stock", description: "Sambel bawang dengan pilihan sachet dan botol 115 g.", variants: [variant("sambel-sachet", "Sachet", 4000), variant("sambel-botol-115g", "Botol 115 g", 20000)], sourcePdfPage: 14, sourceCatalogEntry: 10, status: "pending_verification", verificationNote: "Klaim tanpa pengawet perlu diverifikasi sebelum tayang.", imageAlt: "Foto produk sambel bawang belum tersedia" },
  { id: "cat-11", slug: "madu-murni", name: "Madu Murni", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "ready_stock", description: "Madu murni Akasia Carpa dan Akasia Mangium.", variants: [variant("madu-akasia-carpa", "Akasia Carpa (manis asam) 320 ml", 65000), variant("madu-akasia-mangium", "Akasia Mangium (manis) 320 ml", 69000)], sourcePdfPage: 15, sourceCatalogEntry: 11, status: "pending_verification", verificationNote: "Volume varian kedua perlu dikonfirmasi.", imageAlt: "Foto produk madu murni belum tersedia" },
  { id: "cat-12", slug: "jahe-merapi-joss", name: "Jahe Merapi Joss", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "ready_stock", description: "Jahe Merapi Joss kemasan 250 g.", variants: [variant("jahe-joss-250g", "250 g", 25000)], sourcePdfPage: 16, sourceCatalogEntry: 12, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk Jahe Merapi Joss belum tersedia" },
  { id: "cat-13", slug: "jahe-instan-sari-rempah-merapi", name: "Jahe Instan Sari Rempah Merapi", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "ready_stock", description: "Jahe instan dengan kemasan pouch dan toples.", variants: [variant("jahe-sari-pouch", "Pouch 225 g", 25000), variant("jahe-sari-toples", "Toples 450 g", 45000)], sourcePdfPage: 17, sourceCatalogEntry: 13, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk jahe instan belum tersedia" },
  { id: "cat-14", slug: "risqi-jahe-instan", name: "Risqi Jahe Instan", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "ready_stock", description: "Jahe instan 250 g dan 500 g.", variants: [variant("risqi-250g", "250 g", 23000), variant("risqi-500g", "500 g", 40000)], sourcePdfPage: 18, sourceCatalogEntry: 14, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk Risqi Jahe Instan belum tersedia" },
  { id: "cat-15", slug: "jahe-merah-gula-aren-merapi", name: "Jahe Merah Gula Aren Merapi", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "ready_stock", description: "Jahe merah dengan gula aren.", variants: [variant("jahe-merah-pouch", "Pouch 250 g", 35000), variant("jahe-merah-toples", "Toples 500 g", 70000)], sourcePdfPage: 19, sourceCatalogEntry: 15, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk jahe merah belum tersedia" },
  { id: "cat-16", slug: "kopi-merapi", name: "Kopi Merapi", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "ready_stock", description: "Kopi Arabika, Robusta, dan Blend dari Kopi Merapi.", variants: [variant("kopi-merapi-arabika-75g", "Arabika 75 g", 40000), variant("kopi-merapi-arabika-200g", "Arabika 200 g", 90000), variant("kopi-merapi-robusta-75g", "Robusta 75 g", 30000), variant("kopi-merapi-robusta-200g", "Robusta 200 g", 60000), variant("kopi-merapi-blend-75g", "Blend 75 g", 35000), variant("kopi-merapi-blend-200g", "Blend 200 g", 75000)], sourcePdfPage: 20, sourceCatalogEntry: 16, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk Kopi Merapi belum tersedia" },
  { id: "cat-17", slug: "kopi-kersa", name: "Kopi Kersa", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "ready_stock", description: "Kopi Arabika, Arabika Winey, dan Robusta.", variants: [variant("kopi-kersa-arabika-100g", "Arabika 100 g", 40000), variant("kopi-kersa-winey-200g", "Arabika Winey 200 g", 100000), variant("kopi-kersa-robusta-100g", "Robusta 100 g", 35000), variant("kopi-kersa-robusta-200g", "Robusta 200 g", 65000)], sourcePdfPage: 21, sourceCatalogEntry: 17, status: "pending_verification", verificationNote: pending, imageAlt: "Foto produk Kopi Kersa belum tersedia" },
  { id: "cat-18", slug: "souvenir-ngatmos", name: "Souvenir Ngatmo’s", category: "Kerajinan & souvenir", categorySlug: "kerajinan-souvenir", productType: "ready_stock", description: "Gantungan kunci, pin jarum, dan pin magnet.", variants: [variant("souvenir-44mm", "Ukuran 44 mm", 2500), variant("souvenir-55mm", "Ukuran 55 mm", 3500)], sourcePdfPage: 22, sourceCatalogEntry: 18, status: "pending_verification", verificationNote: "Jenis souvenir dan pemetaan harga berdasarkan ukuran perlu dikonfirmasi.", imageAlt: "Foto souvenir Ngatmo’s belum tersedia" },
  { id: "cat-19", slug: "rumah-jahit-masruroh", name: "Rumah Jahit Masruroh", category: "Fashion & jasa jahit", categorySlug: "fashion-jasa-jahit", productType: "service", description: "Jasa jahit wanita, pria, anak, couple, kemeja, atasan, rok, gamis, dress, celana, kebaya, jas, dan seragam sekolah.", variants: [variant("jahit-masruroh-konsultasi", "Konsultasi jasa jahit", null)], sourcePdfPage: 23, sourceCatalogEntry: 19, status: "pending_verification", verificationNote: "Gunakan form konsultasi; harga belum tercantum.", imageAlt: "Foto Rumah Jahit Masruroh belum tersedia" },
  { id: "cat-20", slug: "yuni-taylor", name: "Yuni Taylor", category: "Fashion & jasa jahit", categorySlug: "fashion-jasa-jahit", productType: "service", description: "Penjualan pakaian dan aksesoris serta jasa jahit dan permak untuk seragam sekolah, PKK, organisasi, kaos, dan kebutuhan lain.", variants: [variant("yuni-taylor-konsultasi", "Minta penawaran", null)], sourcePdfPage: 24, sourceCatalogEntry: 20, status: "pending_verification", verificationNote: "Harga dan kontak publik belum tercantum.", imageAlt: "Foto Yuni Taylor belum tersedia" },
  { id: "cat-21", slug: "tas-rajut", name: "Tas Rajut", category: "Kerajinan & souvenir", categorySlug: "kerajinan-souvenir", productType: "service", description: "Tas kerajinan tangan yang dibuat dengan teknik merajut atau mengait benang dan serat.", variants: [variant("tas-rajut-konsultasi", "Model dan harga melalui konsultasi", null)], sourcePdfPage: 25, sourceCatalogEntry: 21, status: "pending_verification", verificationNote: "Model, ukuran, warna, dan harga belum tersedia.", imageAlt: "Foto tas rajut belum tersedia" },
  { id: "cat-22", slug: "keladi-hias-plastik", name: "Keladi Hias Plastik", category: "Kerajinan & souvenir", categorySlug: "kerajinan-souvenir", productType: "service", description: "Dekorasi keladi yang memanfaatkan plastik bekas untuk ruangan.", variants: [variant("keladi-plastik-konsultasi", "Ukuran dan harga melalui konsultasi", null)], sourcePdfPage: 26, sourceCatalogEntry: 22, status: "pending_verification", verificationNote: "Varian dan harga belum tersedia.", imageAlt: "Foto Keladi Hias Plastik belum tersedia" },
  { id: "cat-23", slug: "susu-pasteurisasi-susu-kurma-jogja", name: "Susu Pasteurisasi dan Susu Kurmanya Jogja", category: "Minuman & herbal", categorySlug: "minuman-herbal", productType: "fresh_preorder", description: "Susu plain, susu rasa-rasa, dan susu kurma.", variants: [variant("susu-plain", "Susu plain", 12000), variant("susu-rasa", "Susu rasa-rasa", 15000), variant("susu-kurma", "Susu kurma", 16000)], sourcePdfPage: 27, sourceCatalogEntry: 23, status: "pending_verification", verificationNote: "Volume kemasan, area antar, dan rantai dingin belum tersedia.", imageAlt: "Foto susu pasteurisasi belum tersedia" },
];

export const catalogImagePlaceholder = "/placeholder-product.svg";

export function getCatalogEntry(slug: string) {
  return catalogEntries.find((entry) => entry.slug === slug);
}

export function formatRupiah(value: number | null) {
  if (value === null) return "Harga menyesuaikan";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value).replace("IDR", "Rp");
}
