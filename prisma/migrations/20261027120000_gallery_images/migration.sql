CREATE TABLE "galeri_foto" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galeri_foto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "galeri_foto_isPublished_sortOrder_idx" ON "galeri_foto"("isPublished", "sortOrder");

INSERT INTO "galeri_foto" ("id", "src", "alt", "title", "isPublished", "sortOrder", "createdAt", "updatedAt") VALUES
  ('gallery-01', '/gallery/kegiatan-01.jpeg', 'Kegiatan warga Forkom UMKM Kepuharjo di balai desa', 'Kegiatan bersama warga', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery-02', '/gallery/kegiatan-02.jpeg', 'Kunjungan dan interaksi warga di kegiatan UMKM Kepuharjo', 'Kunjungan UMKM', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery-03', '/gallery/kegiatan-03.jpeg', 'Produk UMKM Kepuharjo dalam kegiatan warga', 'Produk lokal Kepuharjo', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery-04', '/gallery/kegiatan-04.jpeg', 'Penyerahan produk UMKM Kepuharjo kepada tamu', 'Apresiasi produk lokal', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gallery-05', '/gallery/kegiatan-05.jpeg', 'Pelaku UMKM Kepuharjo berfoto bersama di depan sekretariat', 'Kebersamaan Forkom UMKM', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
