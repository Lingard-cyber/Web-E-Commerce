import Link from "next/link";
import { ArrowRight, CheckCircle2, Package, Search } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicCatalog } from "@/lib/catalog-db";

const categoryGuides: Record<string, { intro: string; items: string[]; flow: string }> = {
  "makanan-camilan": {
    intro: "Temukan makanan rumahan, camilan, olahan siap saji, dan produk pre-order dari pelaku usaha Kepuharjo.",
    items: ["Camilan dan keripik untuk kebutuhan harian atau oleh-oleh.", "Makanan segar dan pre-order yang perlu dikonfirmasi jadwal pemenuhannya.", "Produk dengan pilihan ukuran atau varian yang dapat dibandingkan sebelum membeli."],
    flow: "Produk yang sudah diverifikasi dapat dilanjutkan ke keranjang dan checkout. Untuk produk segar, perhatikan informasi pemenuhan dan pengiriman pada detailnya.",
  },
  "minuman-herbal": {
    intro: "Jelajahi kopi, jahe, madu, susu, dan minuman olahan warga yang dikurasi dalam satu katalog.",
    items: ["Minuman herbal dan olahan rempah untuk persediaan rumah.", "Kopi lokal dengan pilihan jenis atau ukuran kemasan.", "Produk segar yang mungkin memerlukan konfirmasi area dan waktu pengiriman."],
    flow: "Pilih varian yang tersedia, baca status verifikasinya, lalu gunakan alur pembelian produk ketika harga dan stok sudah dikonfirmasi admin.",
  },
  "kerajinan-souvenir": {
    intro: "Kategori ini berisi kerajinan, souvenir, dan karya kreatif yang membawa cerita dari warga Kepuharjo.",
    items: ["Souvenir untuk acara, kenang-kenangan, atau kebutuhan komunitas.", "Kerajinan tangan dengan kemungkinan pilihan model, ukuran, atau warna.", "Layanan atau produk yang dapat memerlukan konsultasi sebelum harga ditetapkan."],
    flow: "Jika harga dan stok sudah tersedia, produk dapat dibeli melalui keranjang. Jika tertulis konsultasi, buka detailnya untuk menyampaikan kebutuhan kepada admin.",
  },
  "fashion-jasa-jahit": {
    intro: "Pilih layanan jahit, permak, pakaian, dan kebutuhan fashion warga sesuai kebutuhan Anda.",
    items: ["Jasa jahit dan permak untuk kebutuhan pribadi atau organisasi.", "Kebutuhan seragam, pakaian, dan pesanan dengan detail khusus.", "Permintaan yang lebih tepat diawali konsultasi agar ukuran, bahan, waktu, dan harga dapat dibahas."],
    flow: "Jasa tidak masuk keranjang. Kirim kebutuhan melalui formulir layanan, kemudian admin Forkom mengoordinasikan penawaran dengan pelaku UMKM.",
  },
};

export const revalidate = 30;

export default async function KategoriPage() {
  const { categories } = await getPublicCatalog();
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Panduan katalog Kepuharjo" title="Pilih kategori yang ingin Anda jelajahi." description="Setiap kategori memiliki karakter produk dan alur pemesanan yang berbeda. Baca penjelasannya, lalu tekan tombol panah untuk membuka daftar item dalam kategori tersebut." /><section className="mb-8 grid gap-3 rounded-3xl bg-forest-950 p-6 text-white sm:grid-cols-3 sm:p-8"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-forest-950"><Search size={18} /></span><span><strong className="block text-sm">1. Pilih kebutuhan</strong><small className="mt-1 block text-[10px] leading-5 text-white/60">Mulai dari jenis produk atau layanan yang Anda cari.</small></span></div><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-accent"><Package size={18} /></span><span><strong className="block text-sm">2. Baca penjelasan</strong><small className="mt-1 block text-[10px] leading-5 text-white/60">Pahami pilihan dan alur transaksi sebelum membuka katalog.</small></span></div><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-accent"><ArrowRight size={18} /></span><span><strong className="block text-sm">3. Buka kategori</strong><small className="mt-1 block text-[10px] leading-5 text-white/60">Tekan tombol panah untuk melihat item yang tersedia.</small></span></div></section><div className="grid gap-5 md:grid-cols-2">{categories.map((category, index) => { const guide = categoryGuides[category.slug]; return <article key={category.slug} className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-xl sm:p-7"><div className="flex items-start justify-between gap-4"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${index % 2 ? "bg-green-50 text-forest-800" : "bg-amber-50 text-amber-700"}`}><Package size={20} /></span><span className="rounded-full bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-muted">{category.count} entri katalog</span></div><h2 className="mt-6 font-display text-2xl font-bold">{category.name}</h2><p className="mt-3 text-sm leading-6 text-muted">{guide?.intro || category.description}</p><div className="mt-5 space-y-3">{(guide?.items || [category.description]).map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-ink"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-forest-700" />{item}</p>)}</div><div className="mt-5 rounded-2xl bg-[#f5f8f4] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-forest-700">Cara melanjutkan</p><p className="mt-2 text-[11px] leading-5 text-muted">{guide?.flow || "Buka kategori untuk melihat item yang tersedia dan status transaksinya."}</p></div><Link href={`/kategori/${category.slug}`} className="group mt-6 inline-flex min-h-11 items-center justify-between rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white hover:bg-forest-700">Baca kategori {category.name}<span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-1"><ArrowRight size={14} /></span></Link></article>; })}</div></main></SiteShell>;
}
