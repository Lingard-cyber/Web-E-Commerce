import { HelpCircle } from "lucide-react";
import { InteriorHero } from "@/components/interior-hero";
import { SiteShell } from "@/components/site-shell";

const questions = [
  ["Bagaimana cara memilih produk?", "Buka detail produk untuk melihat foto, varian, dan harga. Pilih Tambah ke keranjang untuk menyimpan pilihan. Tombol Beli mengarahkan pengunjung yang belum masuk ke halaman login baru. Checkout akan tersedia menyusul."],
  ["Apakah saya harus membuat akun?", "Anda dapat melihat katalog dan menyimpan keranjang tanpa akun. Untuk melanjutkan pembelian, masuk melalui halaman login pelanggan atau buat akun baru."],
  ["Bagaimana jika harga belum tersedia?", "Beberapa produk tambahan dari foto belum memiliki harga. Admin perlu melengkapi harga dan ukuran kemasan sebelum produk tersebut dapat ditambahkan ke keranjang."],
  ["Kapan pembayaran tersedia?", "Pembayaran dan checkout belum dibuka. Pilihan produk yang sudah memiliki harga dapat disimpan di keranjang sambil menunggu tahap berikutnya."],
  ["Bagaimana cara melacak pesanan?", "Buka menu Lacak pesanan, lalu masukkan kode pesanan yang Anda terima setelah checkout. Anda juga dapat melihat riwayat pesanan dari halaman akun."],
  ["Bagaimana jika barang yang diterima rusak atau tidak sesuai?", "Segera simpan foto kondisi barang dan hubungi pengelola melalui halaman Kontak dengan menyertakan kode pesanan. Tim akan membantu memeriksa masalah dan menentukan solusi bersama penjual."],
  ["Bagaimana cara memesan jasa atau layanan?", "Buka menu Jasa & Layanan, pilih layanan yang sesuai, lalu ceritakan kebutuhan, ukuran, jadwal, dan lokasi Anda pada formulir konsultasi. Harga dan jadwal akan dibicarakan terlebih dahulu sebelum Anda menyetujui pesanan."],
  ["Bagaimana UMKM dapat menampilkan produk di marketplace ini?", "Hubungi pengelola melalui halaman Kontak dengan nama usaha, daftar produk atau layanan, foto, harga, area pelayanan, dan nomor yang dapat dihubungi. Data akan ditinjau sebelum ditampilkan kepada pembeli."],
];
export default function BantuanPage() { return <SiteShell><main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 sm:py-14"><InteriorHero eyebrow="Pusat bantuan" title="Jawaban sebelum Anda berbelanja." description="Temukan panduan praktis tentang pembelian, pembayaran, pengiriman, layanan, dan cara menghubungi pengelola." /><div className="space-y-3">{questions.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-card"><summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-bold"><HelpCircle size={17} className="text-forest-700" />{question}<span className="ml-auto text-xl text-muted transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl pl-8 text-sm leading-7 text-muted">{answer}</p></details>)}</div></main></SiteShell>; }
