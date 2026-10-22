# Kepuharjo Market

Website e-commerce terpusat untuk Forkom UMKM Kalurahan Kepuharjo. Implementasi frontend menggunakan Next.js App Router, TypeScript, Tailwind CSS, dan katalog awal yang diturunkan dari `Kepuharjo_Market_Master_Brief_Lengkap.md`.

## Status saat ini

- Seluruh 23 entri katalog telah dimasukkan dengan nama, kategori, varian, dan harga referensi dari brief.
- Semua entri berstatus `pending_verification`; harga adalah referensi historis dan stok sengaja `null` karena belum ada data operasional resmi.
- Belanja, filter, kategori, detail produk, keranjang lokal, akun demo, chat bantuan, lacak pesanan, halaman admin, dan route legal tersedia sebagai fondasi frontend.
- Checkout dan webhook Xendit sengaja mengembalikan status belum siap sampai kredensial dan aturan bisnis dikonfigurasi.

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
```

Sebelum mengubah status produk menjadi `published`, admin Forkom perlu mengisi harga terbaru, stok per varian, foto dan izin penggunaannya, data UMKM/PIC, aturan produk segar, fulfillment, ongkir, dokumen legal, serta role admin. Integrasi order harus memvalidasi ulang harga/stok di server, menggunakan idempotency key, dan memperbarui status hanya dari webhook terautentikasi Xendit.

## Arsitektur singkat

- `app/`: halaman publik, route detail, API order dan webhook.
- `components/`: header proposal, shell, browser katalog, akun, cart, chat, dan UI detail.
- `lib/catalog.ts`: source data katalog awal dan catatan verifikasi.
- `prisma/schema.prisma`: model user, UMKM, kategori, produk/varian, order, pembayaran, inquiry jasa, konten, dan audit log.
- `public/placeholder-product.svg`: placeholder yang membedakan aset resmi belum tersedia.

## Data yang masih diperlukan

Harga/stok aktif, foto berizin, nama dan kontak UMKM, alamat/area pengiriman, metode fulfillment, akun merchant Xendit, domain/hosting/email, teks legal final, konten sambutan lurah, logo resmi, serta kebijakan retur/pembatalan.
