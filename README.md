# Kepuharjo Market

Website katalog Forkom UMKM Kalurahan Kepuharjo. Implementasi menggunakan Next.js App Router, TypeScript, Tailwind CSS, Prisma, dan katalog dari `KATALOG PRODUK FORKOM UMKM KEPUHARJO-MERAH.pdf`.

## Status saat ini

- Seluruh 23 entri katalog PDF disimpan sebagai produk/jasa aktif dengan varian, harga yang tercetak pada PDF, sumber halaman, dan foto PDF pada tabel `gambar_produk`.
- Sebanyak 26 foto tambahan dari pengguna dicocokkan ke produk. Empat produk di luar PDF (Griya Snack, Onde-ondé Ketawa, Stik Kelor, dan Keripik Usus) ditambahkan tanpa harga sampai admin melengkapinya.
- Stok tetap `null` karena PDF tidak mencantumkan stok. Harga PDF perlu dikonfirmasi sebelum checkout dibuka.
- Keranjang dapat dipakai oleh tamu di browser dan disinkronkan ke database saat pengguna masuk. Tombol Beli membawa tamu ke halaman login baru setelah menyimpan pilihannya.
- Checkout dinonaktifkan sampai data harga, stok, pengiriman, dan pembayaran siap.
- Data uji lama yang bertanda `KPH-DUMMY-*`, penyedia pembayaran `dummy`, dan akun `demo@kepuharjomarket.test` dibersihkan saat seed. Produk contoh di luar katalog kemudian dihapus.

## Menjalankan lokal

```powershell
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk production build:

```powershell
npm run build
npm start
```

## Konfigurasi sebelum produksi

Salin `.env.example` menjadi `.env`, lalu isi koneksi Supabase PostgreSQL, Supabase Auth/Storage, dan Xendit. Setelah itu:

```powershell
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

Sebelum mengaktifkan checkout, admin Forkom perlu memeriksa harga terbaru, stok per varian, izin penggunaan foto katalog, data UMKM/PIC, aturan produk segar, fulfillment, ongkir, dan dokumen legal. Checkout API hanya aktif jika `ENABLE_CHECKOUT=true` dan konfigurasi pembayaran tersedia.

## Arsitektur singkat

- `app/`: halaman publik, route detail, API order dan webhook.
- `components/`: header proposal, shell, browser katalog, akun, cart, chat, dan UI detail.
- `lib/catalog.ts`: source data katalog awal dan catatan verifikasi.
- `prisma/schema.prisma`: model user, UMKM, kategori, produk/varian, order, pembayaran, inquiry jasa, konten, dan audit log.
- `public/placeholder-product.svg`: placeholder yang membedakan aset resmi belum tersedia.

## Data yang masih diperlukan

Harga/stok aktif, foto berizin, nama dan kontak UMKM, alamat/area pengiriman, metode fulfillment, akun merchant Xendit, domain/hosting/email, teks legal final, konten sambutan lurah, logo resmi, serta kebijakan retur/pembatalan.
