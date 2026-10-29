UPDATE "produk"
SET
  "description" = 'Jasa jahit dan permak untuk wanita, pria, anak, couple, kemeja, atasan, rok, gamis, dress, celana, kebaya, jas, dan seragam sekolah. Konsultasi ukuran, bahan, model, dan estimasi waktu dilakukan sebelum pengerjaan.',
  "verificationNote" = 'Harga awal; biaya akhir menyesuaikan model, bahan, ukuran, dan tingkat kesulitan.'
WHERE "slug" = 'rumah-jahit-masruroh';

UPDATE "varian_produk"
SET "label" = 'Jahit atau permak mulai', "priceIdr" = 50000
WHERE "sku" = 'catalog-rumah-jahit-masruroh-jahit-masruroh-konsultasi';

UPDATE "produk"
SET
  "description" = 'Layanan jahit, permak, dan pembuatan pakaian untuk seragam sekolah, PKK, organisasi, kaos, serta kebutuhan keluarga. Pelanggan dapat berkonsultasi mengenai desain, ukuran, bahan, dan jumlah pesanan.',
  "verificationNote" = 'Harga awal; penawaran akhir menyesuaikan model dan jumlah pesanan.'
WHERE "slug" = 'yuni-taylor';

UPDATE "varian_produk"
SET "label" = 'Jahit atau permak mulai', "priceIdr" = 35000
WHERE "sku" = 'catalog-yuni-taylor-yuni-taylor-konsultasi';

UPDATE "produk"
SET
  "description" = 'Pembuatan tas rajut custom dengan pilihan model, ukuran, warna, dan jenis benang. Pesanan dibuat berdasarkan kebutuhan pelanggan dan dapat dikonsultasikan terlebih dahulu.',
  "verificationNote" = 'Harga awal; biaya akhir menyesuaikan ukuran, bahan, warna, dan detail custom.'
WHERE "slug" = 'tas-rajut';

UPDATE "varian_produk"
SET "label" = 'Tas rajut custom mulai', "priceIdr" = 75000
WHERE "sku" = 'catalog-tas-rajut-tas-rajut-konsultasi';

UPDATE "produk"
SET
  "description" = 'Pembuatan dekorasi keladi hias dari plastik bekas untuk mempercantik ruangan, acara, atau sudut usaha. Model dan ukuran dapat disesuaikan dengan kebutuhan pemesan.',
  "verificationNote" = 'Harga awal; biaya akhir menyesuaikan ukuran dan detail dekorasi.'
WHERE "slug" = 'keladi-hias-plastik';

UPDATE "varian_produk"
SET "label" = 'Dekorasi mulai', "priceIdr" = 50000
WHERE "sku" = 'catalog-keladi-hias-plastik-keladi-plastik-konsultasi';
