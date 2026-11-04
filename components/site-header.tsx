"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Search, UserRound, X } from "lucide-react";
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

function SearchResultPanel({ results, onSelect }: { results: SearchResult[]; onSelect: (href: string) => void }) {
  if (!results.length) return <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-72 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] text-muted shadow-2xl sm:w-80">Tidak ada halaman, fitur, atau produk yang cocok.</div>;
  return <div className="absolute right-0 top-[calc(100%+8px)] z-[70] max-h-[min(70vh,420px)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"><p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[.16em] text-muted">Hasil pencarian</p>{results.map((result) => <button type="button" key={`${result.group}-${result.href}`} onClick={() => onSelect(result.href)} className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-green-50"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f0f7f1] text-[9px] font-bold text-forest-800">{result.group === "Produk" ? "P" : "↗"}</span><span className="min-w-0"><strong className="block truncate text-[11px] text-forest-950">{result.label}</strong><small className="mt-0.5 block line-clamp-2 text-[10px] leading-4 text-muted">{result.description}</small></span></button>)}</div>;
}

export function SiteHeader({ catalogEntries }: { catalogEntries: CatalogEntry[] }) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const accountHref = userName ? "/akun" : "/akun/login";
  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);
  const searchResults = useMemo<SearchResult[]>(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];
    const pages = searchablePages
      .filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(term))
      .map((item) => ({ ...item, group: "Halaman" as const }));
    const products = catalogEntries
      .filter((item) => `${item.name} ${item.category} ${item.description} ${item.producer || ""}`.toLowerCase().includes(term))
      .map((item) => ({ label: item.name, description: `${item.category} · ${item.producer || "Produk UMKM Kepuharjo"}`, href: `/${item.productType === "service" ? "jasa" : "produk"}/${item.slug}`, group: item.productType === "service" ? "Layanan" as const : "Produk" as const }));
    return [...pages, ...products].slice(0, 10);
  }, [searchQuery]);

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
    if (searchResults[0]) selectSearchResult(searchResults[0].href);
  };

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
            <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" placeholder="Cari produk atau halaman..." aria-label="Cari produk atau halaman" />
            <button type="button" onClick={closeSearch} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-green-50" aria-label="Tutup pencarian"><X size={17} /></button>
            {searchQuery.trim() && <SearchResultPanel results={searchResults} onSelect={selectSearchResult} />}
          </form> : <button type="button" onClick={() => setSearchOpen(true)} className="ml-1 hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm hover:bg-green-50 xl:grid" aria-label="Buka pencarian"><Search size={18} /></button>}
          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            {searchOpen ? <form onSubmit={submitSearch} className="relative flex h-12 w-48 shrink-0 items-center overflow-visible rounded-full border border-slate-200 bg-white px-2 text-forest-950 shadow-sm transition-all duration-300 sm:w-60 xl:hidden"><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" placeholder="Cari..." aria-label="Cari produk" /><button type="button" onClick={closeSearch} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-green-50" aria-label="Tutup pencarian"><X size={20} /></button>{searchQuery.trim() && <SearchResultPanel results={searchResults} onSelect={selectSearchResult} />}</form> : <button type="button" onClick={() => setSearchOpen(true)} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm hover:bg-green-50 xl:hidden" aria-label="Buka pencarian"><Search size={20} /></button>}<CartDrawer /><span className="hidden h-8 w-px bg-slate-200 sm:block" />
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
