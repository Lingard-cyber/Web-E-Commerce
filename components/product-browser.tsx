"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, MessageCircle, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { catalogImagePlaceholder, formatRupiah } from "@/lib/catalog-utils";
import type { CatalogCategory, CatalogEntry, ProductType } from "@/lib/catalog";
import { orderingContacts, orderingWhatsappUrl } from "@/lib/ordering-contacts";

function typeLabel(type: ProductType) {
  if (type === "ready_stock") return "Produk kemasan";
  if (type === "fresh_preorder") return "Pre-order segar";
  return "Konsultasi jasa";
}

function typeTone(type: ProductType) {
  return type === "service" ? "bg-amber-100 text-amber-800" : type === "fresh_preorder" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-forest-800";
}

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id-ID").trim();
}

function editDistanceWithin(left: string, right: string, limit: number) {
  if (Math.abs(left.length - right.length) > limit) return false;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    let rowMinimum = row;
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      current[column] = Math.min(current[column - 1] + 1, previous[column] + 1, previous[column - 1] + cost);
      rowMinimum = Math.min(rowMinimum, current[column]);
    }
    if (rowMinimum > limit) return false;
    previous = current;
  }
  return previous[right.length] <= limit;
}

function matchesSearchTerm(term: string, text: string) {
  const words = text.split(/[^a-z0-9]+/).filter(Boolean);
  return words.some((word) => word.includes(term) || (term.length >= 4 && editDistanceWithin(term, word, term.length >= 7 ? 2 : 1)));
}

export function ProductBrowser({ compact = false, initialCategory, initialSearch = "", mode = "all", entries, showFilters = false }: { compact?: boolean; initialCategory?: string; initialSearch?: string; mode?: "all" | "product" | "service"; entries: CatalogEntry[]; categoryOptions: CatalogCategory[]; showFilters?: boolean }) {
  const [query, setQuery] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory || "all");
  const [type, setType] = useState<ProductType | "all">("all");
  const [price, setPrice] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [showAll, setShowAll] = useState(!compact);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get("search");
    if (urlSearch) setQuery(urlSearch);
  }, []);

  const filtered = useMemo(() => {
    const terms = normalizeSearchText(query).split(/[^a-z0-9]+/).filter(Boolean);
    const result = entries.filter((entry) => {
      const lowest = entry.variants.reduce<number | null>((value, item) => item.priceIdr !== null && (value === null || item.priceIdr < value) ? item.priceIdr : value, null);
      const matchesMode = mode === "all" || (mode === "service" ? entry.productType === "service" : type === "service" ? entry.productType === "service" : entry.productType !== "service");
      const searchText = normalizeSearchText([entry.name, entry.slug, entry.category, entry.description, entry.producer || "", ...entry.variants.map((variant) => variant.label)].join(" "));
      const matchesQuery = !terms.length || terms.every((term) => matchesSearchTerm(term, searchText));
      const matchesCategory = category === "all" || entry.categorySlug === category;
      const matchesType = type === "all" || entry.productType === type;
      const minimum = minPrice ? Number(minPrice) : null;
      const maximum = maxPrice ? Number(maxPrice) : null;
      const hasCustomRange = minimum !== null || maximum !== null;
      const matchesPrice = hasCustomRange ? lowest !== null && (minimum === null || lowest >= minimum) && (maximum === null || lowest <= maximum) : price === "all" || (lowest !== null && (price === "under-25" ? lowest < 25000 : price === "25-75" ? lowest >= 25000 && lowest <= 75000 : lowest > 75000));
      return matchesMode && matchesQuery && matchesCategory && matchesType && matchesPrice;
    });
    if (sort === "featured" && terms.length) {
      const score = (entry: CatalogEntry) => {
        const name = normalizeSearchText(entry.name);
        const text = normalizeSearchText([entry.name, entry.category, entry.producer || "", entry.description, ...entry.variants.map((variant) => variant.label)].join(" "));
        return terms.reduce((total, term) => total + (name === term ? 100 : name.startsWith(term) ? 60 : name.includes(term) ? 40 : 0) + (matchesSearchTerm(term, name) ? 20 : matchesSearchTerm(term, normalizeSearchText(entry.producer || "")) ? 12 : matchesSearchTerm(term, normalizeSearchText(entry.category)) ? 8 : matchesSearchTerm(term, text) ? 2 : 0), 0);
      };
      result.sort((a, b) => score(b) - score(a));
    }
    if (sort === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name, "id"));
    if (sort === "name-desc") result.sort((a, b) => b.name.localeCompare(a.name, "id"));
    return result;
  }, [category, entries, maxPrice, minPrice, mode, price, query, sort, type]);

  const visible = showAll ? filtered : filtered.slice(0, 4);

  return <>
    {(!compact || showFilters) && <div className={`${compact ? "mb-2 border-forest-700/20 bg-[#cfe7d5]" : "mb-3 border-slate-100 bg-white"} flex w-full flex-wrap items-center gap-2 rounded-2xl border p-3 text-sm product-card-shadow`}><span className="font-bold text-slate-700">Cari berdasarkan harga:</span><input type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPrice("all"); }} className="h-10 w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-forest-700" placeholder="Minimal (Rp)" aria-label="Harga minimal" /><span className="text-base font-medium text-slate-700">sampai</span><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPrice("all"); }} className="h-10 w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-forest-700" placeholder="Maksimal (Rp)" aria-label="Harga maksimal" /><span className="text-sm text-slate-600">Atur batas harga sesuai kebutuhan.</span></div>}
    {(!compact || showFilters) && <div className={`${compact ? "mb-6 border-forest-700/20 bg-[#cfe7d5]" : "mb-7 border-slate-100 bg-white"} animate-fade-up rounded-2xl border p-3 product-card-shadow`}><div className="grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr]"><label className="flex h-12 items-center gap-3 rounded-xl bg-white px-4"><Search size={18} className="shrink-0 text-muted" /><input className="w-full bg-transparent text-sm outline-none" placeholder="Cari produk, kategori, atau UMKM..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select value={type} onChange={(event) => setType(event.target.value as ProductType | "all")} className="h-12 rounded-xl border-0 bg-white px-3 text-sm outline-none"><option value="all">Semua jenis</option><option value="ready_stock">Siap kirim</option><option value="fresh_preorder">Segar / pre-order</option><option value="service">Jasa / konsultasi</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 rounded-xl border-0 bg-white px-3 text-sm outline-none"><option value="featured">{query.trim() ? "Paling relevan" : "Terbaru"}</option><option value="name-asc">Nama A-Z</option><option value="name-desc">Nama Z-A</option></select></div></div>}
    <div className="mb-4 flex items-center justify-between"><p className={compact ? "rounded-full bg-white/85 px-3 py-1.5 text-sm text-forest-950 shadow-sm" : "text-sm text-slate-700"}><strong className={compact ? "text-forest-950" : "text-ink"}>{filtered.length}</strong> {mode === "all" ? "hasil" : mode === "service" || type === "service" ? "jasa" : "produk"} ditemukan</p>{!compact && <span className="inline-flex items-center gap-1 text-xs text-slate-600"><Sparkles size={15} className="text-accent" /> Pilihan lokal</span>}</div>
    {filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white py-20 text-sm text-center text-muted">Belum ada produk atau layanan yang sesuai dengan pilihan Anda.</div> : <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">{visible.map((entry, index) => { const contactMessage = `Halo, saya tertarik dengan ${entry.productType === "service" ? "layanan" : "produk"} ${entry.name}. Mohon informasi ketersediaan dan cara pemesanannya.`; const detailHref = `/${entry.productType === "service" ? "jasa" : "produk"}/${entry.slug}`; return <article key={entry.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white product-card-shadow transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"><Link href={detailHref} className="block focus:outline-none focus:ring-4 focus:ring-green-100"><div className="relative aspect-[1.25/1] overflow-hidden bg-[#eef5ef]"><img loading={index > 3 ? "lazy" : "eager"} src={entry.imageSrc || catalogImagePlaceholder} alt={entry.imageAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-4 sm:p-5"><p className="mb-1.5 truncate text-xs font-bold uppercase tracking-wide text-forest-700 sm:text-sm">{entry.category}</p><h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink group-hover:text-forest-800">{entry.name}</h3>{entry.producer && <p className="mt-1 truncate text-sm text-slate-600">{entry.producer}</p>}<span className={`mt-2 inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold ${typeTone(entry.productType)}`}>{typeLabel(entry.productType)}</span></div></Link><div className="flex items-center justify-between gap-2 px-4 pb-4 sm:px-5 sm:pb-5"><strong className="text-sm text-forest-800">{entry.variants[0]?.priceIdr !== null ? `Mulai ${formatRupiah(entry.variants[0]?.priceIdr ?? null)}` : "Harga menyesuaikan"}</strong><Link href={detailHref} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-forest-800 text-white hover:bg-forest-700" aria-label={`Buka detail ${entry.name}`}><ArrowUpRight size={15} /></Link></div><div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5"><div className="grid grid-cols-2 gap-2">{orderingContacts.map((contact) => <a key={contact.number} href={orderingWhatsappUrl(contact.number, contactMessage)} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#25D366] px-2 text-xs font-bold text-white transition hover:bg-[#1ebe5d]" aria-label={`Chat ${contact.label} tentang ${entry.name}`}><MessageCircle size={12} className="mr-1" />{contact.label}</a>)}</div></div></article>; })}</div>}
    {compact && <div className="mt-8 flex justify-center"><Link href={mode === "service" ? "/jasa" : "/produk"} className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-5 text-[10px] font-bold text-forest-800 hover:bg-forest-800 hover:text-white">Lihat semua {mode === "service" ? "jasa" : "produk"} ({filtered.length}) <ArrowRight size={13} className="ml-2" /></Link></div>}
    {!compact && filtered.length > 5 && <div className="mt-8 flex justify-center"><button type="button" className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-5 text-[10px] font-bold text-forest-800 hover:bg-forest-800 hover:text-white" onClick={() => setShowAll((value) => !value)}>{showAll ? "Tampilkan lebih sedikit" : `Muat semua ${filtered.length} entri`} <ChevronDown size={13} className="ml-2" /></button></div>}
  </>;
}
