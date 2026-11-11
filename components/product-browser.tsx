"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, MessageCircle, Search, SlidersHorizontal, Sparkles } from "lucide-react";
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

export function ProductBrowser({ compact = false, initialCategory, initialSearch = "", mode = "all", entries, categoryOptions, showFilters = false }: { compact?: boolean; initialCategory?: string; initialSearch?: string; mode?: "all" | "product" | "service"; entries: CatalogEntry[]; categoryOptions: CatalogCategory[]; showFilters?: boolean }) {
  const [query, setQuery] = useState(initialSearch);
  const [searchScope, setSearchScope] = useState<"product" | "producer">("product");
  const [category, setCategory] = useState(initialCategory || "all");
  const [producer, setProducer] = useState("all");
  const [type, setType] = useState<ProductType | "all">("all");
  const [price, setPrice] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [showAll, setShowAll] = useState(!compact);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileOpenSections, setMobileOpenSections] = useState({ producer: true, category: true, type: true, price: true });

  const producerOptions = useMemo(() => Array.from(new Set(entries.map((entry) => entry.producer).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "id")), [entries]);
  const priceCeiling = Math.max(100000, ...entries.flatMap((entry) => entry.variants.map((variant) => variant.priceIdr || 0)));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get("search");
    if (urlSearch) setQuery(urlSearch);
  }, []);

  const filtered = useMemo(() => {
    const terms = normalizeSearchText(query).split(/[^a-z0-9]+/).filter(Boolean);
    const result = entries.filter((entry) => {
      const lowest = entry.variants.reduce<number | null>((value, item) => item.priceIdr !== null && (value === null || item.priceIdr < value) ? item.priceIdr : value, null);
      const matchesMode = mode === "all" || (mode === "service" ? entry.productType === "service" : entry.productType !== "service");
      const searchText = normalizeSearchText(searchScope === "producer" ? entry.producer || "" : [entry.name, entry.slug, entry.category, entry.description, ...entry.variants.map((variant) => variant.label)].join(" "));
      const matchesQuery = !terms.length || terms.every((term) => matchesSearchTerm(term, searchText));
      const matchesCategory = category === "all" || entry.categorySlug === category;
      const matchesProducer = producer === "all" || entry.producer === producer;
      const matchesType = type === "all" || entry.productType === type;
      const minimum = minPrice ? Number(minPrice) : null;
      const maximum = maxPrice ? Number(maxPrice) : null;
      const hasCustomRange = minimum !== null || maximum !== null;
      const matchesPrice = hasCustomRange ? lowest !== null && (minimum === null || lowest >= minimum) && (maximum === null || lowest <= maximum) : price === "all" || (lowest !== null && (price === "under-25" ? lowest < 25000 : price === "25-75" ? lowest >= 25000 && lowest <= 75000 : lowest > 75000));
      return matchesMode && matchesQuery && matchesCategory && matchesProducer && matchesType && matchesPrice;
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
    if (sort === "price-asc" || sort === "price-desc") result.sort((a, b) => {
      const aPrice = Math.min(...a.variants.map((variant) => variant.priceIdr ?? Number.MAX_SAFE_INTEGER));
      const bPrice = Math.min(...b.variants.map((variant) => variant.priceIdr ?? Number.MAX_SAFE_INTEGER));
      return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    });
    return result;
  }, [category, entries, maxPrice, minPrice, mode, price, producer, query, searchScope, sort, type]);

  const visible = showAll ? filtered : filtered.slice(0, 4);

  return <>
    {(!compact || showFilters) && <>
      <div className="mb-3 hidden flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm sm:flex sm:gap-3"><span className="shrink-0 text-xs font-bold text-forest-950">Rentang harga</span><input type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPrice("all"); }} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-forest-700 sm:flex-none sm:w-36" placeholder="Minimal (Rp)" aria-label="Harga minimal" /><span className="text-xs text-muted">sampai</span><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPrice("all"); }} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-forest-700 sm:flex-none sm:w-36" placeholder="Maksimal (Rp)" aria-label="Harga maksimal" /><select value={price} onChange={(event) => { setPrice(event.target.value); setMinPrice(""); setMaxPrice(""); }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-forest-950 outline-none focus:border-forest-700 sm:w-auto"><option value="all">Semua harga</option><option value="under-25">Di bawah Rp25.000</option><option value="25-75">Rp25.000–Rp75.000</option><option value="over-75">Di atas Rp75.000</option></select></div>
      <div className="mb-6 hidden animate-fade-up rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:block"><div className="grid gap-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]"><label className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-[#f8faf7] px-3"><Search size={17} className="shrink-0 text-muted" /><input className="w-full min-w-0 bg-transparent text-xs outline-none" placeholder={searchScope === "producer" ? "Cari nama UMKM..." : "Cari nama produk..."} value={query} onChange={(event) => setQuery(event.target.value)} /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 min-w-0 rounded-xl border border-slate-100 bg-[#f8faf7] px-3 text-xs text-forest-950 outline-none focus:border-forest-700"><option value="all">Semua kategori</option>{categoryOptions.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value as ProductType | "all")} className="h-11 min-w-0 rounded-xl border border-slate-100 bg-[#f8faf7] px-3 text-xs text-forest-950 outline-none focus:border-forest-700"><option value="all">{mode === "service" ? "Semua layanan" : "Semua jenis"}</option>{mode !== "service" && <><option value="ready_stock">Siap kirim</option><option value="fresh_preorder">Segar / pre-order</option></>}{mode !== "product" && <option value="service">Jasa / konsultasi</option>}</select><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 min-w-0 rounded-xl border border-slate-100 bg-[#f8faf7] px-3 text-xs text-forest-950 outline-none focus:border-forest-700"><option value="featured">{query.trim() ? "Paling relevan" : "Terbaru"}</option><option value="price-asc">Harga terendah</option><option value="price-desc">Harga tertinggi</option><option value="name-asc">Nama A-Z</option><option value="name-desc">Nama Z-A</option></select></div></div>
      <div className="mb-5 sm:hidden">
        <div className="flex items-center border-b border-slate-200 bg-white">
          <button type="button" onClick={() => { setMobileSortOpen((value) => !value); setMobileFiltersOpen(false); }} className="flex h-11 flex-1 items-center justify-center gap-1 border-r border-slate-200 text-xs font-semibold text-slate-800"><span>Urutkan</span><ChevronDown size={14} className={mobileSortOpen ? "rotate-180" : ""} /></button>
          <button type="button" onClick={() => { setMobileFiltersOpen((value) => !value); setMobileSortOpen(false); }} aria-expanded={mobileFiltersOpen} className="flex h-11 flex-1 items-center justify-center gap-2 text-xs font-semibold text-slate-800"><SlidersHorizontal size={15} /> Filter{[producer !== "all", category !== "all", type !== "all", price !== "all" || Boolean(minPrice || maxPrice)].filter(Boolean).length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-forest-800 px-1 text-[10px] text-white">{[producer !== "all", category !== "all", type !== "all", price !== "all" || Boolean(minPrice || maxPrice)].filter(Boolean).length}</span>}</button>
        </div>
        {mobileSortOpen && <div className="rounded-b-xl border border-t-0 border-slate-200 bg-white p-2 shadow-md">{[{ value: "featured", label: query.trim() ? "Paling relevan" : "Terbaru" }, { value: "price-asc", label: "Harga terendah" }, { value: "price-desc", label: "Harga tertinggi" }, { value: "name-asc", label: "Nama A-Z" }, { value: "name-desc", label: "Nama Z-A" }].map((option) => <button type="button" key={option.value} onClick={() => { setSort(option.value); setMobileSortOpen(false); }} className="flex min-h-10 w-full items-center justify-between px-3 text-left text-xs text-slate-800"><span>{option.label}</span><span className={`grid h-4 w-4 place-items-center rounded-full border ${sort === option.value ? "border-forest-700" : "border-slate-300"}`}>{sort === option.value && <span className="h-2 w-2 rounded-full bg-forest-700" />}</span></button>)}</div>}
        {mobileFiltersOpen && <div className="space-y-1 rounded-b-xl border border-t-0 border-slate-200 bg-white p-3 shadow-md">
          <div className="mb-3 grid grid-cols-2 rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => { setSearchScope("product"); setQuery(""); }} className={`h-8 rounded-md text-[11px] font-semibold ${searchScope === "product" ? "bg-white text-forest-950 shadow-sm" : "text-slate-600"}`}>Produk</button><button type="button" onClick={() => { setSearchScope("producer"); setQuery(""); }} className={`h-8 rounded-md text-[11px] font-semibold ${searchScope === "producer" ? "bg-white text-forest-950 shadow-sm" : "text-slate-600"}`}>UMKM</button></div>
          <label className="mb-2 flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={15} className="shrink-0 text-muted" /><input className="w-full bg-transparent text-xs outline-none" placeholder={searchScope === "producer" ? "Cari nama UMKM..." : "Cari nama produk..."} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <details open={mobileOpenSections.producer} onToggle={(event) => setMobileOpenSections({ ...mobileOpenSections, producer: event.currentTarget.open })} className="border-b border-slate-100 pb-2"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-semibold text-slate-800">UMKM {producer !== "all" && <span className="font-normal text-forest-800">{producer}</span>}<ChevronDown size={14} /></summary><div className="flex flex-wrap gap-2 pt-2"><button type="button" onClick={() => setProducer("all")} className={`rounded-full px-3 py-1.5 text-[11px] ${producer === "all" ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>Semua</button>{producerOptions.map((item) => <button type="button" key={item} onClick={() => setProducer(producer === item ? "all" : item)} className={`rounded-full px-3 py-1.5 text-[11px] ${producer === item ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>{item}</button>)}</div></details>
          <details open={mobileOpenSections.category} onToggle={(event) => setMobileOpenSections({ ...mobileOpenSections, category: event.currentTarget.open })} className="border-b border-slate-100 pb-2"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-semibold text-slate-800">Kategori {category !== "all" && <span className="font-normal text-forest-800">{categoryOptions.find((item) => item.slug === category)?.name}</span>}<ChevronDown size={14} /></summary><div className="flex flex-wrap gap-2 pt-2"><button type="button" onClick={() => setCategory("all")} className={`rounded-full px-3 py-1.5 text-[11px] ${category === "all" ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>Semua kategori</button>{categoryOptions.filter((item) => !item.comingSoon).map((item) => <button type="button" key={item.slug} onClick={() => setCategory(category === item.slug ? "all" : item.slug)} className={`rounded-full px-3 py-1.5 text-[11px] ${category === item.slug ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>{item.name}</button>)}</div></details>
          <details open={mobileOpenSections.type} onToggle={(event) => setMobileOpenSections({ ...mobileOpenSections, type: event.currentTarget.open })} className="border-b border-slate-100 pb-2"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-semibold text-slate-800">Jenis produk<ChevronDown size={14} /></summary><div className="flex flex-wrap gap-2 pt-2"><button type="button" onClick={() => setType("all")} className={`rounded-full px-3 py-1.5 text-[11px] ${type === "all" ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>{mode === "service" ? "Semua layanan" : "Semua jenis"}</button>{mode !== "service" && <>{(["ready_stock", "fresh_preorder"] as ProductType[]).map((value) => <button type="button" key={value} onClick={() => setType(type === value ? "all" : value)} className={`rounded-full px-3 py-1.5 text-[11px] ${type === value ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>{value === "ready_stock" ? "Siap kirim" : "Segar / pre-order"}</button>)}</>}{mode !== "product" && <button type="button" onClick={() => setType(type === "service" ? "all" : "service")} className={`rounded-full px-3 py-1.5 text-[11px] ${type === "service" ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>Jasa</button>}</div></details>
          <details open={mobileOpenSections.price} onToggle={(event) => setMobileOpenSections({ ...mobileOpenSections, price: event.currentTarget.open })} className="pb-1"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-semibold text-slate-800">Harga<ChevronDown size={14} /></summary><div className="pt-2"><input type="range" min="0" max={priceCeiling} step="5000" value={maxPrice ? Math.min(Number(maxPrice), priceCeiling) : priceCeiling} onChange={(event) => { setMaxPrice(event.target.value); setPrice("all"); }} className="h-2 w-full accent-forest-700" aria-label="Batas harga maksimal" /><div className="mt-2 grid grid-cols-2 gap-2"><input type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPrice("all"); }} className="h-9 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-forest-700" placeholder="Minimal (Rp)" aria-label="Harga minimal" /><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPrice("all"); }} className="h-9 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-forest-700" placeholder={`Maksimal Rp${priceCeiling.toLocaleString("id-ID")}`} aria-label="Harga maksimal" /></div><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => { setPrice("all"); setMinPrice(""); setMaxPrice(""); }} className={`rounded-full px-3 py-1.5 text-[11px] ${price === "all" && !minPrice && !maxPrice ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>Semua harga</button><button type="button" onClick={() => { setPrice("under-25"); setMinPrice(""); setMaxPrice(""); }} className={`rounded-full px-3 py-1.5 text-[11px] ${price === "under-25" ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>Di bawah 25 ribu</button><button type="button" onClick={() => { setPrice("25-75"); setMinPrice(""); setMaxPrice(""); }} className={`rounded-full px-3 py-1.5 text-[11px] ${price === "25-75" ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>25-75 ribu</button><button type="button" onClick={() => { setPrice("over-75"); setMinPrice(""); setMaxPrice(""); }} className={`rounded-full px-3 py-1.5 text-[11px] ${price === "over-75" ? "bg-forest-800 text-white" : "bg-slate-100 text-slate-700"}`}>Di atas 75 ribu</button></div></div></details>
          <button type="button" onClick={() => setMobileFiltersOpen(false)} className="mt-2 h-10 w-full rounded-full bg-forest-800 text-xs font-bold text-white">Terapkan filter</button>
        </div>}
      </div>
    </>}
    <div className="mb-4 flex items-center justify-between"><p className={compact ? "rounded-full bg-white/85 px-3 py-1.5 text-sm text-forest-950 shadow-sm" : "text-sm text-slate-700"}><strong className={compact ? "text-forest-950" : "text-ink"}>{filtered.length}</strong> {mode === "all" ? "hasil" : mode === "service" || type === "service" ? "jasa" : "produk"} ditemukan</p>{!compact && <span className="inline-flex items-center gap-1 text-xs text-slate-600"><Sparkles size={15} className="text-accent" /> Pilihan lokal</span>}</div>
    {filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white py-20 text-sm text-center text-muted">Belum ada produk atau layanan yang sesuai dengan pilihan Anda.</div> : <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">{visible.map((entry, index) => { const contactMessage = `Halo, saya tertarik dengan ${entry.productType === "service" ? "layanan" : "produk"} ${entry.name}. Mohon informasi ketersediaan dan cara pemesanannya.`; const detailHref = `/${entry.productType === "service" ? "jasa" : "produk"}/${entry.slug}`; return <article key={entry.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white product-card-shadow transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"><Link href={detailHref} className="block focus:outline-none focus:ring-4 focus:ring-green-100"><div className="relative aspect-[1.25/1] overflow-hidden bg-[#eef5ef]"><img loading={index > 3 ? "lazy" : "eager"} src={entry.imageSrc || catalogImagePlaceholder} alt={entry.imageAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-4 sm:p-5"><p className="mb-1.5 truncate text-xs font-bold uppercase tracking-wide text-forest-700 sm:text-sm">{entry.category}</p><h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink group-hover:text-forest-800">{entry.name}</h3>{entry.producer && <p className="mt-1 truncate text-sm text-slate-600">{entry.producer}</p>}<span className={`mt-2 inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold ${typeTone(entry.productType)}`}>{typeLabel(entry.productType)}</span></div></Link><div className="flex items-center justify-between gap-2 px-4 pb-4 sm:px-5 sm:pb-5"><strong className="text-sm text-forest-800">{entry.variants[0]?.priceIdr !== null ? `Mulai ${formatRupiah(entry.variants[0]?.priceIdr ?? null)}` : "Harga menyesuaikan"}</strong><Link href={detailHref} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-forest-800 text-white hover:bg-forest-700" aria-label={`Buka detail ${entry.name}`}><ArrowUpRight size={15} /></Link></div><div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5"><div className="grid grid-cols-2 gap-2">{orderingContacts.map((contact) => <a key={contact.number} href={orderingWhatsappUrl(contact.number, contactMessage)} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#25D366] px-2 text-xs font-bold text-white transition hover:bg-[#1ebe5d]" aria-label={`Chat ${contact.label} tentang ${entry.name}`}><MessageCircle size={12} className="mr-1" />{contact.label}</a>)}</div></div></article>; })}</div>}
    {compact && <div className="mt-8 flex justify-center"><Link href={mode === "service" ? "/jasa" : "/produk"} className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-[10px] font-bold text-forest-950 shadow-sm hover:bg-white">Lihat semua {mode === "service" ? "jasa" : "produk"} ({filtered.length}) <ArrowRight size={13} className="ml-2" /></Link></div>}
    {!compact && filtered.length > 5 && <div className="mt-8 flex justify-center"><button type="button" className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-5 text-[10px] font-bold text-forest-800 hover:bg-forest-800 hover:text-white" onClick={() => setShowAll((value) => !value)}>{showAll ? "Tampilkan lebih sedikit" : `Muat semua ${filtered.length} entri`} <ChevronDown size={13} className="ml-2" /></button></div>}
  </>;
}
