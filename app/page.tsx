import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Compass, Layers3, MapPin, Package, Store, UsersRound } from "lucide-react";
import { ProductBrowser } from "@/components/product-browser";
import { SiteShell } from "@/components/site-shell";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { getPublicCatalog } from "@/lib/catalog-db";

export const revalidate = 30;

const benefits = [
  [Compass, "Mudah dijelajahi", "Kategori dan pencarian dibuat singkat."],
  [BadgeCheck, "Info lebih jelas", "Kenali status produk sebelum membeli."],
  [Package, "Alur terarah", "Keranjang dan checkout disiapkan bertahap."],
  [Store, "Etalase bersama", "Dikelola terpusat oleh admin Forkom."],
] as const;

export default async function HomePage() {
  const { entries, categories } = await getPublicCatalog();
  return <SiteShell><main className="storefront-home">
    <section className="mx-auto max-w-[1240px] px-4 pt-5 sm:px-6 sm:pt-8">
      <div className="shopcart-hero relative isolate overflow-hidden rounded-[28px] bg-forest-950 px-6 py-8 text-white shadow-[0_24px_60px_rgba(3,61,45,.18)] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        <div className="hero-pattern pointer-events-none absolute inset-0 opacity-20" /><div className="soft-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.03fr_.97fr]">
          <div className="animate-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-2 text-[9px] font-bold uppercase tracking-[.14em] text-forest-950 shadow-sm"><Layers3 size={13} /> Marketplace UMKM Kepuharjo</p>
            <h1 className="max-w-2xl font-display text-[clamp(2.65rem,6vw,5.7rem)] font-bold leading-[.92] tracking-[-.06em]">Dari Kepuharjo,<br /><span className="text-accent">untuk lebih banyak rumah.</span></h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/72">Jelajahi rasa, karya, dan jasa warga dalam satu etalase digital yang hangat, mudah dipahami, dan siap berkembang.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/belanja" className="inline-flex min-h-12 items-center rounded-full bg-white px-5 text-[11px] font-bold text-forest-800 shadow-lg hover:-translate-y-1 hover:shadow-xl">Mulai belanja <ArrowRight size={14} className="ml-2" /></Link><Link href="/kategori" className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-5 text-[11px] font-bold text-white hover:-translate-y-1 hover:border-accent hover:text-accent">Jelajahi kategori <ArrowUpRight size={14} className="ml-2" /></Link></div>
          </div>
          <div className="relative min-h-[390px] animate-fade-up [animation-delay:180ms] sm:min-h-[500px]">
            <div className="absolute left-[8%] top-[8%] h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
            <HomeHeroCarousel />
          </div>
        </div>
      </div>
    </section>

    <section className="relative z-10 mx-auto -mt-4 max-w-[1160px] px-4 sm:-mt-5 sm:px-6"><div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_30px_rgba(24,66,45,.09)] sm:grid-cols-4">{benefits.map(([Icon, title, copy], index) => <div key={title} className={(index < 3 ? "border-b border-slate-100 sm:border-b-0 sm:border-r " : "") + "flex gap-3 px-4 py-4 sm:px-5 sm:py-5"}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green-50 text-forest-700"><Icon size={16} /></span><span><strong className="block text-[10px] text-forest-800 sm:text-[11px]">{title}</strong><small className="mt-1 block text-[9px] leading-4 text-muted">{copy}</small></span></div>)}</div></section>


    <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Belanja lebih terarah</p><h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none">Cari sesuai kebutuhan.</h2><p className="mt-3 max-w-xl text-xs leading-6 text-muted">Pilih kategori untuk menemukan produk dan jasa dari katalog awal Kepuharjo.</p></div><Link href="/kategori" className="hidden items-center text-[11px] font-bold text-forest-800 sm:flex">Semua kategori <ArrowRight size={13} className="ml-2" /></Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category, index) => <Link href={`/kategori/${category.slug}`} key={category.slug} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 product-card-shadow hover:-translate-y-1 hover:shadow-xl"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[80px] bg-green-50 transition group-hover:bg-accent/20" /><div className="relative mb-7 flex items-center justify-between"><span className={index % 2 ? "grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700" : "grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-forest-700"}><Package size={17} /></span><ArrowUpRight size={16} className="text-muted transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-forest-800" /></div><h3 className="relative font-display text-xl font-bold">{category.name}</h3><p className="relative mt-2 text-[10px] leading-5 text-muted">{category.description}</p><p className="relative mt-4 text-[9px] font-bold uppercase tracking-widest text-forest-700">{category.count} entri</p></Link>)}</div></section>

    <section className="bg-white"><div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Etalase bersama</p><h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none">Produk pilihan Kepuharjo.</h2><p className="mt-3 text-xs text-muted">Cari langsung dari beranda berdasarkan nama, kategori, jenis, atau rentang harga.</p></div><Link href="/produk" className="inline-flex w-fit items-center rounded-full border border-forest-700 px-4 py-2.5 text-[10px] font-bold text-forest-800 transition hover:bg-forest-800 hover:text-white">Lihat semua produk <ArrowRight size={13} className="ml-2" /></Link></div><ProductBrowser compact mode="product" showFilters entries={entries} categoryOptions={categories} /></div></section>

    <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Jasa & layanan</p><h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none">Butuh bantuan dari warga?</h2><p className="mt-3 max-w-xl text-xs leading-6 text-muted">Layanan dipesan melalui form kebutuhan dan koordinasi admin, bukan melalui keranjang produk.</p></div><Link href="/jasa" className="inline-flex w-fit items-center rounded-full border border-forest-700 px-4 py-2.5 text-[10px] font-bold text-forest-800 transition hover:bg-forest-800 hover:text-white">Lihat semua jasa <ArrowRight size={13} className="ml-2" /></Link></div><ProductBrowser compact mode="service" entries={entries} categoryOptions={categories} /></section>

    <section className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 sm:pb-20"><div className="grid overflow-hidden rounded-[28px] bg-[#e8f1eb] shadow-sm md:grid-cols-[.9fr_1.1fr]"><div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-forest-800 p-8 text-center md:min-h-[390px]"><div className="hero-pattern absolute inset-0 opacity-25" /><div className="relative"><UsersRound size={38} className="mx-auto mb-6 text-accent" /><span className="font-display text-4xl font-bold text-white">Satu Kepuharjo.<br /><span className="text-accent">Banyak karya.</span></span></div></div><div className="flex flex-col justify-center p-7 sm:p-12"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-forest-800">Cerita pelaku usaha</p><h2 className="mb-4 max-w-xl font-display text-[clamp(2rem,4vw,3.3rem)] font-bold leading-none">Bukan hanya menjual produk.</h2><p className="mb-6 max-w-xl text-sm leading-7 text-muted">Setiap UMKM punya ruang untuk memperkenalkan produk, proses, dan semangat yang dibawa dari rumah.</p><Link href="/umkm" className="inline-flex min-h-11 w-fit items-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white hover:-translate-y-1 hover:bg-forest-700">Kenali pelaku usaha <ArrowRight size={13} className="ml-2" /></Link></div></div></section>

    <section className="bg-forest-950 text-white"><div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-[1.1fr_.9fr] md:items-center"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-accent">Sambutan Lurah</p><h2 className="max-w-xl font-display text-[clamp(2rem,4vw,3.3rem)] font-bold leading-none">Belanja dengan rasa memiliki.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/65">Halaman sambutan resmi akan menjadi ruang untuk memperkenalkan dukungan kalurahan terhadap tumbuhnya UMKM Kepuharjo.</p><Link href="/sambutan-lurah" className="mt-7 inline-flex items-center text-[10px] font-bold text-accent">Baca sambutan <ArrowRight size={13} className="ml-2" /></Link></div><div className="rounded-3xl border border-white/10 bg-white/[.06] p-7 backdrop-blur-sm"><MapPin className="mb-5 text-accent" size={28} /><p className="font-display text-2xl font-bold leading-tight">Kaki Merapi,<br />rumah bagi karya.</p><p className="mt-4 text-[10px] leading-5 text-white/50">Naskah dan identitas resmi menunggu persetujuan publikasi.</p></div></div></section>

    <section className="soft-grid"><div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-4 py-14 sm:px-6 sm:py-16 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Siap menjelajah?</p><h2 className="mt-2 font-display text-3xl font-bold">Temukan cerita di balik produk.</h2></div><Link href="/belanja" className="inline-flex min-h-12 w-fit items-center rounded-full bg-accent px-5 text-[11px] font-bold text-forest-950 hover:-translate-y-1 hover:shadow-lg">Jelajahi katalog <ArrowRight size={14} className="ml-2" /></Link></div></section>
  </main><WhatsAppFloat /></SiteShell>;
}
