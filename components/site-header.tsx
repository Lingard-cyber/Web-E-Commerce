"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { LogoutDialog } from "@/components/logout-dialog";
import { breakAuthSession } from "@/lib/auth-logout";
import type { CatalogEntry } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";

const primaryLinks = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Jasa & Layanan", href: "/jasa" },
  { label: "Kategori", href: "/kategori" },
  { label: "UMKM", href: "/umkm" },
  { label: "Kontak", href: "/#kontak" },
];

const utilityLinks = [
  { label: "Sambutan Lurah", href: "/sambutan-lurah" },
  { label: "Bantuan", href: "/bantuan" },
];

const topUtilityLinks = utilityLinks;

const searchablePages = [
  { label: "Beranda", description: "Halaman utama storefront Kepuharjo", href: "/" },
  { label: "Produk", description: "Katalog produk UMKM Kepuharjo", href: "/produk" },
  { label: "Jasa & Layanan", description: "Jasa, konsultasi, dan layanan warga", href: "/jasa" },
  { label: "Kategori", description: "Jelajahi kategori produk dan jasa", href: "/kategori" },
  { label: "UMKM", description: "Kenali pelaku UMKM Kepuharjo", href: "/umkm" },
  { label: "Tentang Kepuharjo", description: "Tentang platform dan wilayah Kepuharjo", href: "/tentang-kepuharjo" },
  { label: "Sambutan Lurah", description: "Sambutan resmi Kalurahan Kepuharjo", href: "/sambutan-lurah" },
  { label: "Kontak", description: "Lokasi dan kontak admin Kepuharjo", href: "/#kontak" },
  { label: "Bantuan", description: "Pusat bantuan dan pertanyaan umum", href: "/bantuan" },
  { label: "Galeri", description: "Foto kegiatan dan kebersamaan UMKM", href: "/galeri" },
  { label: "Keranjang belanja", description: "Lihat produk yang disimpan", href: "/keranjang" },
  { label: "Masuk", description: "Masuk ke akun pelanggan", href: "/akun/login" },
  { label: "Daftar", description: "Buat akun pelanggan baru", href: "/akun/daftar" },
];

type SearchResult = { label: string; description: string; href: string; group: "Halaman" | "Produk" | "Layanan" };

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id-ID").trim();
}

function SearchResultPanel({ results, activeIndex, onSelect, onHover }: { results: SearchResult[]; activeIndex: number; onSelect: (href: string) => void; onHover: (index: number) => void }) {
  if (!results.length) return <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-72 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] text-muted shadow-2xl sm:w-80">Tidak ada halaman, fitur, atau produk yang cocok.</div>;
  return <div role="listbox" aria-label="Hasil pencarian" className="absolute right-0 top-[calc(100%+8px)] z-[70] max-h-[min(70vh,420px)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"><p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[.16em] text-muted">Hasil pencarian</p>{results.map((result, index) => <button type="button" role="option" aria-selected={index === activeIndex} key={`${result.group}-${result.href}`} onMouseEnter={() => onHover(index)} onClick={() => onSelect(result.href)} className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${index === activeIndex ? "bg-green-50" : "hover:bg-green-50"}`}><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f0f7f1] text-forest-800">{result.group === "Produk" ? <span className="text-[9px] font-bold">P</span> : <ArrowUpRight size={14} />}</span><span className="min-w-0"><strong className="block truncate text-[11px] text-forest-950">{result.label}</strong><small className="mt-0.5 block line-clamp-2 text-[10px] leading-4 text-muted">{result.description}</small></span><small className="ml-auto mt-1 shrink-0 text-[9px] text-muted">{result.group}</small></button>)}</div>;
}
export function SiteHeader({ catalogEntries }: { catalogEntries: CatalogEntry[] }) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const accountHref = userName ? "/akun" : "/akun/login";
  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);
  const searchResults = useMemo<SearchResult[]>(() => {
    const term = normalizeSearchText(searchQuery);
    if (!term) return [];
    const terms = term.split(/\s+/).filter(Boolean);
    const ranked: Array<{ result: SearchResult; score: number }> = [];
    const addResult = (result: SearchResult, fields: { label: string; producer?: string; category?: string; description: string }) => {
      const label = normalizeSearchText(fields.label);
      const producer = normalizeSearchText(fields.producer || "");
      const category = normalizeSearchText(fields.category || "");
      const description = normalizeSearchText(fields.description);
      const allText = `${label} ${producer} ${category} ${description}`;
      if (!terms.every((word) => allText.includes(word))) return;
      let score = label === term ? 120 : label.startsWith(term) ? 90 : label.includes(term) ? 70 : 0;
      for (const word of terms) {
        if (label.includes(word)) score += 20;
        else if (producer.includes(word)) score += 14;
        else if (category.includes(word)) score += 10;
        else if (description.includes(word)) score += 3;
      }
      ranked.push({ result, score });
    };

    searchablePages.forEach((page) => addResult({ ...page, group: "Halaman" }, page));
    catalogEntries.forEach((item) => {
      const group = item.productType === "service" ? "Layanan" as const : "Produk" as const;
      addResult({ label: item.name, description: `${item.category} · ${item.producer || "Produk UMKM Kepuharjo"}`, href: `/${group === "Layanan" ? "jasa" : "produk"}/${item.slug}`, group }, {
        label: item.name,
        producer: item.producer,
        category: item.category,
        description: [item.description, item.serviceRequirements, item.serviceAvailability, item.serviceDuration].filter(Boolean).join(" "),
      });
    });
    return ranked.sort((a, b) => b.score - a.score || a.result.label.localeCompare(b.result.label, "id")).slice(0, 10).map(({ result }) => result);
  }, [catalogEntries, searchQuery]);

  useEffect(() => setActiveSearchIndex(0), [searchQuery]);
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const selectSearchResult = (href: string) => {
    router.push(href);
    closeSearch();
    closeMenu();
  };

  const openLogoutDialog = () => {
    if (loggingOut) return;
    setOpen(false);
    setLogoutOpen(true);
  };

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await breakAuthSession("/");
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/cari?q=${encodeURIComponent(query)}`);
    closeSearch();
    closeMenu();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    } else if (event.key === "ArrowDown" && searchResults.length) {
      event.preventDefault();
      setActiveSearchIndex((index) => (index + 1) % searchResults.length);
    } else if (event.key === "ArrowUp" && searchResults.length) {
      event.preventDefault();
      setActiveSearchIndex((index) => (index - 1 + searchResults.length) % searchResults.length);
    }
  };
  const searchPanelProps = { results: searchResults, activeIndex: activeSearchIndex, onSelect: selectSearchResult, onHover: setActiveSearchIndex };

  useEffect(() => {
    const supabase = createClient();
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserName(String(data.user?.user_metadata?.name || data.user?.email?.split("@")[0] || ""));
    };
    syncUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => syncUser());
    return () => listener.subscription.unsubscribe();
  }, []);

  const closeMenu = () => setOpen(false);
  const linkClass = (href: string) => `${isActive(href) ? "bg-forest-950 text-white " : "text-forest-950 hover:bg-green-50 "}whitespace-nowrap rounded-full px-1.5 py-2.5 text-[12px] font-bold transition lg:px-2 lg:text-[13px] xl:px-2.5 xl:text-sm 2xl:px-3 2xl:text-[15px]`;

  return <>
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8faf7]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 xl:max-w-[1360px] 2xl:max-w-[1440px]">
        <div className="flex min-h-[82px] flex-nowrap items-center gap-2 sm:gap-3 lg:gap-2">
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm xl:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Buka menu">{open ? <X size={21} /> : <Menu size={21} />}</button>
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 lg:w-[188px] xl:w-[200px] 2xl:w-[220px]" onClick={closeMenu}>
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-accent bg-white shadow-sm lg:h-14 lg:w-14"><img src="/logo-kepuharjo.jpeg" alt="Logo FORKOM UMKM KEPUHARJO" className="h-full w-full object-contain" /></span>
            <span className="min-w-0 leading-none"><span className="block text-[12px] font-extrabold leading-[.98] tracking-[-.02em] text-forest-950 sm:text-[13px] lg:text-sm">FORKOM UMKM<br />KEPUHARJO</span><span className="mt-1 hidden text-[11px] text-muted sm:block lg:text-xs">Produk lokal, pasar lebih luas</span></span>
          </Link>
          <nav className="scrollbar-hide hidden min-w-0 flex-1 items-center justify-start gap-0 overflow-x-auto xl:flex">{primaryLinks.map((item) => <Link key={item.href} href={item.href} className={linkClass(item.href)}>{item.label}</Link>)}<span className="mx-1 h-6 w-px shrink-0 bg-slate-200 xl:mx-1.5" aria-hidden="true" />{topUtilityLinks.map((item) => <Link key={item.href} href={item.href} className={linkClass(item.href)}>{item.label}</Link>)}</nav>
          {searchOpen ? <form onSubmit={submitSearch} className="relative ml-1 hidden h-11 w-64 shrink-0 items-center overflow-visible rounded-full border border-slate-200 bg-white px-3 text-forest-950 shadow-sm xl:flex">
            <input autoFocus value={searchQuery} onKeyDown={handleSearchKeyDown} onChange={(event) => setSearchQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" placeholder="Cari produk atau halaman..." aria-label="Cari produk atau halaman" aria-autocomplete="list" />
            <button type="button" onClick={closeSearch} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-green-50" aria-label="Tutup pencarian"><X size={17} /></button>
            {searchQuery.trim() && <SearchResultPanel {...searchPanelProps} />}
          </form> : <button type="button" onClick={() => setSearchOpen(true)} className="ml-1 hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm hover:bg-green-50 xl:grid" aria-label="Buka pencarian"><Search size={18} /></button>}
          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            {searchOpen ? <form onSubmit={submitSearch} className="relative flex h-12 w-48 shrink-0 items-center overflow-visible rounded-full border border-slate-200 bg-white px-2 text-forest-950 shadow-sm transition-all duration-300 sm:w-60 xl:hidden"><input autoFocus value={searchQuery} onKeyDown={handleSearchKeyDown} onChange={(event) => setSearchQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" placeholder="Cari..." aria-label="Cari produk atau halaman" aria-autocomplete="list" /><button type="button" onClick={closeSearch} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-green-50" aria-label="Tutup pencarian"><X size={20} /></button>{searchQuery.trim() && <SearchResultPanel {...searchPanelProps} />}</form> : <button type="button" onClick={() => setSearchOpen(true)} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm hover:bg-green-50 xl:hidden" aria-label="Buka pencarian"><Search size={20} /></button>}<CartDrawer /><span className="hidden h-8 w-px bg-slate-200 sm:block" />
            {userName ? <Link href={accountHref} title={`Akun ${userName}`} className="group grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm transition hover:-translate-y-0.5 hover:border-forest-700"><UserRound size={20} className="transition group-hover:scale-110" /></Link> : <div className="hidden items-center gap-2 sm:flex"><Link href="/akun/login" className="inline-flex h-11 items-center rounded-full border border-forest-800 bg-white px-4 text-[12px] font-bold text-forest-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-forest-800 hover:text-white">Masuk</Link><Link href="/akun/daftar" className="inline-flex h-11 items-center rounded-full bg-forest-800 px-4 text-[12px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest-700">Daftar</Link></div>}
            {userName && <button type="button" onClick={openLogoutDialog} disabled={loggingOut} title="Keluar dari akun" aria-label="Keluar dari akun" className="hidden h-11 items-center gap-2 rounded-full border border-red-100 bg-white px-4 text-[12px] font-bold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 sm:flex"><LogOut size={16} />Keluar</button>}
          </div>
        </div>
        <nav className={(open ? "flex animate-fade-up " : "hidden ") + "absolute left-4 right-4 top-[94px] max-h-[calc(100vh-110px)] flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl xl:hidden"}>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-muted">Belanja</p>
          {primaryLinks.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className={`${isActive(item.href) ? "bg-forest-950 text-white" : "text-forest-950 hover:bg-green-50"} flex items-center justify-between rounded-xl px-3 py-3 text-[13px] font-bold transition`}>{item.label}</Link>)}
          <p className="mt-2 border-t border-slate-100 px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[.16em] text-muted">Informasi</p>
          {utilityLinks.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className={`${isActive(item.href) ? "bg-forest-950 text-white" : "text-forest-950 hover:bg-green-50"} flex items-center justify-between rounded-xl px-3 py-3 text-[13px] font-bold transition`}>{item.label}</Link>)}
          <div className="mt-2 grid gap-2 border-t border-slate-100 pt-3">{userName ? <Link href="/akun" onClick={closeMenu} className="flex items-center gap-2 rounded-xl bg-forest-950 px-3 py-3 text-[13px] font-bold text-white"><UserRound size={17} />Akun {userName}</Link> : <div className="grid grid-cols-2 gap-2"><Link href="/akun/login" onClick={closeMenu} className="flex items-center justify-center rounded-xl border border-forest-800 px-3 py-3 text-[13px] font-bold text-forest-800">Masuk</Link><Link href="/akun/daftar" onClick={closeMenu} className="flex items-center justify-center rounded-xl bg-forest-800 px-3 py-3 text-[13px] font-bold text-white">Daftar</Link></div>}</div>
          {userName && <button type="button" onClick={openLogoutDialog} disabled={loggingOut} className="mt-2 flex items-center gap-2 rounded-xl border border-red-100 px-3 py-3 text-left text-[13px] font-bold text-red-600 disabled:cursor-wait disabled:opacity-60"><LogOut size={17} />Keluar dari akun</button>}
        </nav>
      </div>
    </header>
    <LogoutDialog open={logoutOpen} loading={loggingOut} onCancel={() => setLogoutOpen(false)} onConfirm={logout} />
  </>;
}
