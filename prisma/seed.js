require("dotenv").config({ override: true });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Kategori ini mengikuti katalog PDF resmi Forkom UMKM Kepuharjo.
// Dua kategori terakhir sengaja disiapkan sebagai coming soon.
const kategoriData = [
  { slug: "makanan-camilan", name: "Makanan & Camilan", description: "Camilan rumahan dan olahan lokal Kepuharjo.", sortOrder: 1 },
  { slug: "minuman-herbal", name: "Minuman & Herbal", description: "Minuman olahan, jahe, madu, susu, dan produk herbal.", sortOrder: 2 },
  { slug: "kerajinan-souvenir", name: "Kerajinan & Souvenir", description: "Kerajinan tangan dan souvenir karya warga Kepuharjo.", sortOrder: 3 },
  { slug: "fashion-jasa-jahit", name: "Fashion & Jasa Jahit", description: "Pakaian, jahit, permak, dan kebutuhan tekstil.", sortOrder: 4 },
  { slug: "pertanian-hasil-bumi", name: "Pertanian & Hasil Bumi", description: "Coming soon: produk pertanian dan hasil bumi Kepuharjo.", sortOrder: 5 },
  { slug: "jasa-lainnya", name: "Jasa Lainnya", description: "Coming soon: pilihan jasa warga lainnya.", sortOrder: 6 },
];

const galeriData = [
  { src: "/gallery/kegiatan-01.jpeg", alt: "Kegiatan warga Forkom UMKM Kepuharjo di balai desa", title: "Kegiatan bersama warga", sortOrder: 1 },
  { src: "/gallery/kegiatan-02.jpeg", alt: "Kunjungan dan interaksi warga di kegiatan UMKM Kepuharjo", title: "Kunjungan UMKM", sortOrder: 2 },
  { src: "/gallery/kegiatan-03.jpeg", alt: "Produk UMKM Kepuharjo dalam kegiatan warga", title: "Produk lokal Kepuharjo", sortOrder: 3 },
  { src: "/gallery/kegiatan-04.jpeg", alt: "Penyerahan produk UMKM Kepuharjo kepada tamu", title: "Apresiasi produk lokal", sortOrder: 4 },
  { src: "/gallery/kegiatan-05.jpeg", alt: "Pelaku UMKM Kepuharjo berfoto bersama di depan sekretariat", title: "Kebersamaan Forkom UMKM", sortOrder: 5 },
];

async function main() {
  for (const item of kategoriData) {
    await prisma.category.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  for (const item of galeriData) {
    const existing = await prisma.galleryImage.findFirst({ where: { src: item.src } });
    if (existing) {
      await prisma.galleryImage.update({ where: { id: existing.id }, data: { ...item, isPublished: true } });
    } else {
      await prisma.galleryImage.create({ data: { ...item, isPublished: true } });
    }
  }

  // Data uji lama tidak boleh tampil pada deploy. Produk tidak dihapus secara
  // fisik agar histori pesanan tetap aman; status archived mengecualikannya
  // dari katalog publik dan admin dapat menghapusnya secara terkontrol nanti.
  const archived = await prisma.product.updateMany({
    where: {
      OR: [
        { verificationNote: { contains: "dummy" } },
        { slug: { startsWith: "keripik-jamur-egi-ds" } },
        { slug: { startsWith: "manggleng-pedas-manis" } },
        { slug: { startsWith: "jasa-jahit-masruroh" } },
        { slug: { startsWith: "souvenir-kepuharjo" } },
        { slug: { startsWith: "katering-rumahan-kepuharjo" } },
      ],
    },
    data: { publishStatus: "archived" },
  });

  console.log(`Seed deploy selesai: ${kategoriData.length} kategori dan ${galeriData.length} foto galeri disiapkan, serta ${archived.count} produk dummy diarsipkan.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
