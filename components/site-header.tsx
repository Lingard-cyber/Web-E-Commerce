"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { LoginModal } from "@/components/login-modal";
import { breakAuthSession } from "@/lib/auth-logout";
import { createClient } from "@/lib/supabase/client";

const primaryLinks = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Jasa & Layanan", href: "/jasa" },
  { label: "Kategori", href: "/kategori" },
  { label: "UMKM", href: "/umkm" },
];

const utilityLinks = [
  { label: "Tentang Kepuharjo", href: "/tentang-kepuharjo" },
  { label: "Sambutan Lurah", href: "/sambutan-lurah" },
  { label: "Kontak", href: "/kontak" },
  { label: "Bantuan", href: "/bantuan" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();
  const accountHref = userName ? "/akun" : "/akun/login";
  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await breakAuthSession("/");
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
  const linkClass = (href: string) => `${isActive(href) ? "bg-forest-950 text-white " : "text-forest-950 hover:bg-green-50 "}whitespace-nowrap rounded-full px-2.5 py-2.5 text-[10px] font-bold transition`;

  return <>
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8faf7]/95 backdrop-blur-xl">
      <div className="hidden border-b border-slate-200/70 bg-[#f1f5f1] sm:block"><div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between gap-4 px-4 text-[9px] sm:px-6"><span className="truncate font-semibold text-muted">Etalase digital produk lokal Kepuharjo</span><nav className="flex shrink-0 items-center gap-4 text-muted">{utilityLinks.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-forest-800">{item.label}</Link>)}</nav></div></div>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex min-h-[66px] items-center gap-2 sm:gap-3 lg:gap-2">
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Buka menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 lg:w-[188px] xl:w-[200px]" onClick={closeMenu}>
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent bg-white shadow-sm"><img src="/forkom-umkm-kepuharjo.jpg" alt="Logo FORKOM UMKM KEPUHARJO" className="h-full w-full object-cover" /></span>
            <span className="min-w-0 leading-none"><span className="block text-[10px] font-extrabold leading-[.98] tracking-[-.02em] text-forest-950 sm:text-[11px] lg:text-[11px]">FORKOM UMKM<br />KEPUHARJO</span><span className="mt-1 hidden text-[7px] text-muted sm:block">Produk lokal, pasar lebih luas</span></span>
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center justify-start gap-0 lg:flex">{primaryLinks.map((item) => <Link key={item.href} href={item.href} className={linkClass(item.href)}>{item.label}</Link>)}</nav>
          <Link href="/produk" className="ml-2 hidden h-9 min-w-0 max-w-[270px] flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[9px] text-muted shadow-sm transition hover:border-forest-700 hover:shadow-md lg:flex"><Search size={14} className="shrink-0 text-forest-700" /><span className="truncate">Cari produk atau jasa...</span></Link>
          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <Link href="/produk" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm transition hover:-translate-y-0.5 hover:border-forest-700 lg:hidden" aria-label="Cari produk"><Search size={17} /></Link><CartDrawer /><span className="hidden h-7 w-px bg-slate-200 sm:block" />
            {userName ? <Link href={accountHref} title={`Akun ${userName}`} className="group grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-sm transition hover:-translate-y-0.5 hover:border-forest-700"><UserRound size={17} className="transition group-hover:scale-110" /></Link> : <div className="hidden items-center gap-2 sm:flex"><button type="button" onClick={() => setLoginOpen(true)} className="inline-flex h-10 items-center rounded-full border border-forest-800 bg-white px-3 text-[10px] font-bold text-forest-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-forest-800 hover:text-white">Masuk</button><Link href="/akun/daftar" className="inline-flex h-10 items-center rounded-full bg-forest-800 px-3 text-[10px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest-700">Daftar</Link></div>}
            {userName && <button type="button" onClick={logout} disabled={loggingOut} title="Keluar dari akun" aria-label="Keluar dari akun" className="hidden h-10 items-center gap-2 rounded-full border border-red-100 bg-white px-3 text-[10px] font-bold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 sm:flex"><LogOut size={15} />{loggingOut ? "Keluar..." : "Keluar"}</button>}
          </div>
        </div>
        <nav className={(open ? "flex animate-fade-up " : "hidden ") + "absolute left-4 right-4 top-[84px] max-h-[calc(100vh-100px)] flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl lg:hidden"}>
          <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[.16em] text-muted">Belanja</p>
          {primaryLinks.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className={`${isActive(item.href) ? "bg-forest-950 text-white" : "text-forest-950 hover:bg-green-50"} flex items-center justify-between rounded-xl px-3 py-3 text-[11px] font-bold transition`}>{item.label}</Link>)}
          <p className="mt-2 border-t border-slate-100 px-3 pb-2 pt-4 text-[9px] font-bold uppercase tracking-[.16em] text-muted">Informasi</p>
          {utilityLinks.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className={`${isActive(item.href) ? "bg-forest-950 text-white" : "text-forest-950 hover:bg-green-50"} flex items-center justify-between rounded-xl px-3 py-3 text-[11px] font-bold transition`}>{item.label}</Link>)}
          <div className="mt-2 grid gap-2 border-t border-slate-100 pt-3">{userName ? <Link href="/akun" onClick={closeMenu} className="flex items-center gap-2 rounded-xl bg-forest-950 px-3 py-3 text-[11px] font-bold text-white"><UserRound size={15} />Akun {userName}</Link> : <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { closeMenu(); setLoginOpen(true); }} className="flex items-center justify-center rounded-xl border border-forest-800 px-3 py-3 text-[11px] font-bold text-forest-800">Masuk</button><Link href="/akun/daftar" onClick={closeMenu} className="flex items-center justify-center rounded-xl bg-forest-800 px-3 py-3 text-[11px] font-bold text-white">Daftar</Link></div>}<Link href="/lacak-pesanan" onClick={closeMenu} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-[11px] font-bold text-forest-950"><ClipboardList size={15} />Lacak pesanan</Link><Link href="/keranjang" onClick={closeMenu} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-[11px] font-bold text-forest-950"><ShoppingBag size={15} />Keranjang belanja</Link></div>
          {userName && <button type="button" onClick={logout} disabled={loggingOut} className="mt-2 flex items-center gap-2 rounded-xl border border-red-100 px-3 py-3 text-left text-[11px] font-bold text-red-600 disabled:cursor-wait disabled:opacity-60"><LogOut size={15} />{loggingOut ? "Keluar..." : "Keluar dari akun"}</button>}
        </nav>
      </div>
    </header>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
  </>;
}
