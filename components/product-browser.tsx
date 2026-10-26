"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CatalogEntry, catalogEntries, catalogImagePlaceholder, categories, formatRupiah, ProductType } from "@/lib/catalog";

function typeLabel(type: ProductType) {
  if (type === "ready_stock") return "Siap dikirim";
  if (type === "fresh_preorder") return "Pre-order segar";
  return "Konsultasi jasa";
}

function typeTone(type: ProductType) {
  return type === "service" ? "bg-amber-100 text-amber-800" : type === "fresh_preorder" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-forest-800";
}

export function ProductBrowser({ compact = false, initialCategory, mode = "all", entries = catalogEntries, categoryOptions = categories, showFilters = false }: { compact?: boolean; initialCategory?: string; mode?: "all" | "product" | "service"; entries?: CatalogEntry[]; categoryOptions?: typeof categories | { slug: string; name: string; count: number; description: string }[]; showFilters?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory || "all");
  const [type, setType] = useState<ProductType | "all">("all");
  const [price, setPrice] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [showAll, setShowAll] = useState(!compact);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = entries.filter((entry) => {
      const lowest = entry.variants.reduce<number | null>((value, item) => item.priceIdr !== null && (value === null || item.priceIdr < value) ? item.priceIdr : value, null);
      const matchesMode = mode === "all" || (mode === "service" ? entry.productType === "service" : entry.productType !== "service");
      const matchesQuery = !term || `${entry.name} ${entry.category} ${entry.description} ${entry.producer || ""}`.toLowerCase().includes(term);
      const matchesCategory = category === "all" || entry.categorySlug === category;
      const matchesType = type === "all" || entry.productType === type;
      const minimum = minPrice ? Number(minPrice) : null;
      const maximum = maxPrice ? Number(maxPrice) : null;
      const hasCustomRange = minimum !== null || maximum !== null;
      const matchesPrice = hasCustomRange ? lowest !== null && (minimum === null || lowest >= minimum) && (maximum === null || lowest <= maximum) : price === "all" || (lowest !== null && (price === "under-25" ? lowest < 25000 : price === "25-75" ? lowest >= 25000 && lowest <= 75000 : lowest > 75000));
      return matchesMode && matchesQuery && matchesCategory && matchesType && matchesPrice;
    });
    if (sort === "price-low") result.sort((a, b) => (a.variants[0]?.priceIdr ?? Infinity) - (b.variants[0]?.priceIdr ?? Infinity));
    if (sort === "price-high") result.sort((a, b) => (b.variants[0]?.priceIdr ?? -1) - (a.variants[0]?.priceIdr ?? -1));
    return result;
  }, [category, entries, maxPrice, minPrice, mode, price, query, sort, type]);

  const visible = showAll ? filtered : filtered.slice(0, 5);

  return <>
    {(!compact || showFilters) && <div className={`${compact ? "mb-2 border-forest-700/10 bg-[#f5f8f4]" : "mb-3 border-slate-100 bg-white"} flex flex-wrap items-center gap-2 rounded-2xl border p-3 text-[10px] product-card-shadow`}><span className="font-bold text-muted">Cari berdasarkan harga:</span><input type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPrice("all"); }} className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-forest-700" placeholder="Minimal (Rp)" aria-label="Harga minimal" /><span className="text-muted">sampai</span><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPrice("all"); }} className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-forest-700" placeholder="Maksimal (Rp)" aria-label="Harga maksimal" /><span className="text-[9px] text-muted">Kosongkan salah satu untuk mencari batas bawah atau batas atas.</span></div>}
    {(!compact || showFilters) && <div className={`${compact ? "mb-6 border-forest-700/10 bg-[#f5f8f4]" : "mb-7 border-slate-100 bg-white"} animate-fade-up rounded-2xl border p-3 product-card-shadow`}><div className="grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"><label className="flex h-12 items-center gap-3 rounded-xl bg-white px-4"><Search size={16} className="text-muted" /><input className="w-full bg-transparent text-xs outline-none" placeholder="Cari produk, kategori, atau UMKM..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-xl border-0 bg-white px-3 text-xs outline-none"><option value="all">Semua kategori</option>{categoryOptions.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value as ProductType | "all")} className="h-12 rounded-xl border-0 bg-white px-3 text-xs outline-none"><option value="all">Semua jenis</option><option value="ready_stock">Siap kirim</option><option value="fresh_preorder">Segar / pre-order</option><option value="service">Jasa / konsultasi</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 rounded-xl border-0 bg-white px-3 text-xs outline-none"><option value="featured">Paling relevan</option><option value="price-low">Harga terendah</option><option value="price-high">Harga tertinggi</option></select></div><div className="mt-3 flex flex-wrap items-center gap-2 border-t border-forest-700/10 pt-3"><span className="mr-1 text-[10px] font-bold text-muted">Harga</span>{[["all", "Semua"], ["under-25", "Di bawah Rp25rb"], ["25-75", "Rp25–75rb"], ["over-75", "Di atas Rp75rb"]].map(([value, label]) => <button type="button" key={value} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${price === value ? "border-forest-800 bg-forest-800 text-white" : "border-slate-200 bg-white text-muted hover:border-forest-700 hover:text-forest-800"}`} onClick={() => setPrice(value)}>{label}</button>)}</div></div>}
    <div className="mb-4 flex items-center justify-between"><p className="text-xs text-muted"><strong className="text-ink">{filtered.length}</strong> {mode === "service" ? "jasa" : "produk"} ditemukan</p>{!compact && <span className="inline-flex items-center gap-1 text-[10px] text-muted"><Sparkles size={13} className="text-accent" /> Pilihan lokal</span>}</div>
    {filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white py-20 text-center text-sm text-muted">Belum ada produk atau layanan yang sesuai dengan pilihan Anda.</div> : <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">{visible.map((entry, index) => <article key={entry.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white product-card-shadow transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"><Link href={`/produk/${entry.slug}`} className="block focus:outline-none focus:ring-4 focus:ring-green-100"><div className="relative aspect-[1.25/1] overflow-hidden bg-[#eef5ef]"><img loading={index > 3 ? "lazy" : "eager"} src={entry.imageSrc || catalogImagePlaceholder} alt={entry.imageAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3"><span className={`rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold tracking-wide shadow-sm ${entry.status === "published" ? "text-forest-800" : "text-amber-800"}`}>{entry.status === "published" ? "TERSEDIA" : "SEGERA HADIR"}</span>{(entry.images?.length || 1) > 1 && <span className="rounded-full bg-forest-950/75 px-2.5 py-1 text-[8px] font-bold text-white">{entry.images?.length} foto</span>}</div></div><div className="p-4 sm:p-5"><p className="mb-1.5 truncate text-[8px] font-bold uppercase tracking-wide text-forest-700">{entry.category}</p><h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-ink group-hover:text-forest-800">{entry.name}</h3>{entry.producer && <p className="mt-1 truncate text-[9px] text-muted">{entry.producer}</p>}<span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[8px] font-bold ${typeTone(entry.productType)}`}>{typeLabel(entry.productType)}</span></div></Link><div className="flex items-center justify-between gap-2 px-4 pb-4 sm:px-5 sm:pb-5"><strong className="text-xs text-forest-800">{entry.variants[0]?.priceIdr !== null ? `Mulai ${formatRupiah(entry.variants[0]?.priceIdr ?? null)}` : "Harga menyesuaikan"}</strong><Link href={`/produk/${entry.slug}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forest-800 text-white hover:bg-forest-700" aria-label={`Buka detail ${entry.name}`}><ArrowUpRight size={14} /></Link></div></article>)}</div>}
    {compact && <div className="mt-8 flex justify-center"><Link href={mode === "service" ? "/jasa" : "/produk"} className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-5 text-[10px] font-bold text-forest-800 hover:bg-forest-800 hover:text-white">Lihat semua {mode === "service" ? "jasa" : "produk"} ({filtered.length}) <ArrowRight size={13} className="ml-2" /></Link></div>}
    {!compact && filtered.length > 5 && <div className="mt-8 flex justify-center"><button type="button" className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-5 text-[10px] font-bold text-forest-800 hover:bg-forest-800 hover:text-white" onClick={() => setShowAll((value) => !value)}>{showAll ? "Tampilkan lebih sedikit" : `Muat semua ${filtered.length} entri`} <ChevronDown size={13} className="ml-2" /></button></div>}
  </>;
}
