"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, Eye, FileWarning, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { CatalogEntry, catalogEntries, catalogImagePlaceholder, categories, formatRupiah, ProductType } from "@/lib/catalog";

function typeLabel(type: ProductType) {
  if (type === "ready_stock") return "Siap dikirim";
  if (type === "fresh_preorder") return "Pre-order segar";
  return "Konsultasi jasa";
}

function typeTone(type: ProductType) {
  return type === "service" ? "bg-amber-100 text-amber-800" : type === "fresh_preorder" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-forest-800";
}

export function ProductBrowser({ compact = false, initialCategory }: { compact?: boolean; initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory || "all");
  const [type, setType] = useState<ProductType | "all">("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const [showAll, setShowAll] = useState(!compact);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = catalogEntries.filter((entry) => {
      const lowest = entry.variants.reduce<number | null>((value, item) => item.priceIdr !== null && (value === null || item.priceIdr < value) ? item.priceIdr : value, null);
      const matchesQuery = !term || `${entry.name} ${entry.category} ${entry.description}`.toLowerCase().includes(term);
      const matchesCategory = category === "all" || entry.categorySlug === category;
      const matchesType = type === "all" || entry.productType === type;
      const matchesPrice = price === "all" || (lowest !== null && (price === "under-25" ? lowest < 25000 : price === "25-75" ? lowest >= 25000 && lowest <= 75000 : lowest > 75000));
      return matchesQuery && matchesCategory && matchesType && matchesPrice;
    });
    if (sort === "price-low") result.sort((a, b) => (a.variants[0].priceIdr ?? Infinity) - (b.variants[0].priceIdr ?? Infinity));
    if (sort === "price-high") result.sort((a, b) => (b.variants[0].priceIdr ?? -1) - (a.variants[0].priceIdr ?? -1));
    return result;
  }, [category, price, query, sort, type]);

  const visible = showAll ? filtered : filtered.slice(0, 5);
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3200); };
  const addDraftToCart = () => showNotice("Produk menunggu verifikasi admin sebelum dapat dimasukkan ke keranjang.");

  return <>
    {!compact && <div className="animate-fade-up mb-7 flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-[11px] leading-5 text-amber-900 shadow-sm md:items-center"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100"><FileWarning size={18} /></span><p><strong>Etalase tahap verifikasi.</strong> Harga berasal dari katalog referensi. Stok, foto, izin publikasi, dan status tayang perlu dikonfirmasi admin Forkom.</p></div>}
    {!compact && <div className="animate-fade-up mb-7 rounded-2xl border border-slate-100 bg-white p-3 product-card-shadow"><div className="grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"><label className="flex h-12 items-center gap-3 rounded-xl bg-[#f5f8f4] px-4"><Search size={16} className="text-muted" /><input className="w-full bg-transparent text-xs outline-none" placeholder="Cari produk atau kategori..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-xl border-0 bg-[#f5f8f4] px-3 text-xs outline-none"><option value="all">Semua kategori</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value as ProductType | "all")} className="h-12 rounded-xl border-0 bg-[#f5f8f4] px-3 text-xs outline-none"><option value="all">Semua jenis</option><option value="ready_stock">Siap kirim</option><option value="fresh_preorder">Segar / pre-order</option><option value="service">Jasa / konsultasi</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 rounded-xl border-0 bg-[#f5f8f4] px-3 text-xs outline-none"><option value="featured">Paling relevan</option><option value="price-low">Harga terendah</option><option value="price-high">Harga tertinggi</option></select></div><div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3"><span className="mr-1 text-[10px] font-bold text-muted">Harga</span>{[["all", "Semua"], ["under-25", "Di bawah Rp25rb"], ["25-75", "Rp25–75rb"], ["over-75", "Di atas Rp75rb"]].map(([value, label]) => <button key={value} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${price === value ? "border-forest-800 bg-forest-800 text-white" : "border-slate-200 bg-white text-muted hover:border-forest-700 hover:text-forest-800"}`} onClick={() => setPrice(value)}>{label}</button>)}</div></div>}
    <div className="mb-4 flex items-center justify-between"><p className="text-xs text-muted"><strong className="text-ink">{filtered.length}</strong> produk ditemukan</p>{!compact && <span className="inline-flex items-center gap-1 text-[10px] text-muted"><Sparkles size={13} className="text-accent" /> Pilihan lokal</span>}</div>
    {filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white py-20 text-center text-sm text-muted">Tidak ada produk yang cocok dengan filter ini.</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">{visible.map((entry, index) => <article className="group animate-fade-up overflow-hidden rounded-2xl border border-slate-100 bg-white product-card-shadow transition duration-300 hover:-translate-y-1.5 hover:shadow-xl" style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }} key={entry.id}><div className="relative aspect-[1.35/1] overflow-hidden bg-[#eef5ef]"><img src={entry.imageSrc || catalogImagePlaceholder} alt={entry.imageAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 top-0 flex items-center justify-between p-3"><span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold tracking-wide text-amber-800 shadow-sm">DRAFT</span><button onClick={() => setSelected(entry)} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-forest-800 shadow-sm hover:bg-forest-800 hover:text-white" aria-label={`Lihat cepat ${entry.name}`}><Eye size={14} /></button></div></div><div className="p-3.5"><p className="mb-1.5 truncate text-[8px] font-bold uppercase tracking-wide text-forest-700">{entry.category}</p><button className="block text-left" onClick={() => setSelected(entry)}><h3 className="line-clamp-2 min-h-9 text-[11px] font-bold leading-4 text-ink group-hover:text-forest-800">{entry.name}</h3></button><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[8px] font-bold ${typeTone(entry.productType)}`}>{typeLabel(entry.productType)}</span><div className="mt-3 flex items-end justify-between gap-2"><strong className="text-[11px] text-forest-800">{entry.variants[0]?.priceIdr !== null ? `Mulai ${formatRupiah(entry.variants[0]?.priceIdr ?? null)}` : "Harga menyesuaikan"}</strong><button onClick={addDraftToCart} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest-800 text-white hover:bg-forest-700" aria-label={`Tambah ${entry.name} ke keranjang`}><ShoppingBag size={13} /></button></div></div></article>)}</div>}
    {compact && <div className="mt-8 flex justify-center"><Link href="/belanja" className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-5 text-[10px] font-bold text-forest-800 hover:bg-forest-800 hover:text-white">Lihat semua produk ({catalogEntries.length}) <ArrowRight size={13} className="ml-2" /></Link></div>}
    {!compact && filtered.length > 5 && <div className="mt-8 flex justify-center"><button className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-5 text-[10px] font-bold text-forest-800 hover:bg-forest-800 hover:text-white" onClick={() => setShowAll((value) => !value)}>{showAll ? "Tampilkan lebih sedikit" : `Muat semua ${filtered.length} entri`} <ChevronDown size={13} className="ml-2" /></button></div>}

    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-forest-950/65 p-4 backdrop-blur-md" onClick={() => setSelected(null)}><div role="dialog" aria-modal="true" aria-label={`Detail ${selected.name}`} className="animate-modal-in grid max-h-[min(720px,92vh)] w-full max-w-3xl overflow-auto rounded-[28px] bg-white shadow-2xl md:grid-cols-[.9fr_1.1fr]" onClick={(event) => event.stopPropagation()}><div className="relative min-h-64 bg-[#eef5ef] md:min-h-full"><img src={selected.imageSrc || catalogImagePlaceholder} alt={selected.imageAlt} className="h-full w-full object-cover" /><button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:rotate-90" onClick={() => setSelected(null)} aria-label="Tutup detail"><X size={16} /></button></div><div className="p-6 sm:p-8"><div className="mb-4 flex items-center justify-between gap-3"><span className="rounded-full bg-amber-100 px-3 py-1.5 text-[9px] font-bold text-amber-800">PENDING VERIFICATION</span><span className="text-[10px] text-muted">{selected.category}</span></div><h2 className="mb-3 font-display text-2xl font-bold leading-tight sm:text-3xl">{selected.name}</h2><p className="mb-5 text-[11px] leading-6 text-muted">{selected.description}</p><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-900"><strong>Belum bisa dibeli</strong><br />{selected.verificationNote || "Harga, stok, foto, dan izin tayang belum diverifikasi."}</div><div className="mt-5 space-y-2">{selected.variants.map((item) => <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-3 text-[10px]" key={item.id}><span>{item.label}</span><strong className="text-forest-800">{formatRupiah(item.priceIdr)}</strong></div>)}</div><div className="mt-5 flex items-center gap-2 text-[10px] text-muted"><CheckCircle2 size={14} className="text-forest-700" /> Stok akan ditampilkan setelah diverifikasi admin.</div><div className="mt-6 grid gap-2 sm:grid-cols-2"><button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-forest-800 text-[10px] font-bold text-forest-800 hover:bg-green-50" onClick={addDraftToCart}><ShoppingBag size={14} className="mr-2" />Tambah ke keranjang</button><Link href={`/produk/${selected.slug}`} onClick={() => setSelected(null)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-800 text-[10px] font-bold text-white hover:bg-forest-700">Buka halaman produk <ArrowRight size={14} className="ml-2" /></Link></div></div></div></div>}
    {notice && <div className="animate-toast-in fixed bottom-5 left-1/2 z-[60] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2 rounded-full bg-forest-950 px-4 py-3 text-[11px] text-white shadow-xl"><CheckCircle2 size={14} className="shrink-0 text-accent" />{notice}</div>}
  </>;
}
