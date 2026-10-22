"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ClipboardList, Menu, ShoppingBag, Store, UserRound, X } from "lucide-react";
import { CartDrawer } from "@/components/cart-drawer";

const links: Array<{ label: string; href: string; dropdown?: boolean }> = [
  { label: "Beranda", href: "/" },
  { label: "Belanja", href: "/belanja", dropdown: true },
  { label: "Kategori", href: "/kategori", dropdown: true },
  { label: "UMKM", href: "/umkm" },
  { label: "Tentang", href: "/tentang-kepuharjo", dropdown: true },
  { label: "Sambutan", href: "/sambutan-lurah" },
  { label: "Artikel", href: "/artikel" },
  { label: "Bantuan", href: "/bantuan" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();
  const accountHref = userName ? "/akun" : "/akun/login";

  useEffect(() => {
    const syncUser = () => { try { const saved = JSON.parse(localStorage.getItem("kepuharjo-user") || "null"); setUserName(saved?.name || ""); } catch { setUserName(""); } };
    syncUser();
    window.addEventListener("kepuharjo-auth-updated", syncUser);
    return () => window.removeEventListener("kepuharjo-auth-updated", syncUser);
  }, []);

  return <header className="sticky top-0 z-50 bg-[#f5f8f4]/90 px-3 pt-3 backdrop-blur-md sm:px-5"><div className="mx-auto flex min-h-[64px] max-w-[1180px] items-center gap-3 rounded-[18px] bg-forest-950 px-3 text-white shadow-[0_10px_28px_rgba(3,61,45,.17)] sm:px-5"><button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 md:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Buka menu">{open ? <X size={18} /> : <Menu size={18} />}</button><Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-accent/80 bg-forest-800 text-accent shadow-[inset_0_0_0_3px_rgba(255,255,255,.12)]"><Store size={22} /></span><span className="leading-none"><span className="block whitespace-nowrap text-[12px] font-extrabold tracking-[-.02em] sm:text-[14px]">KEPUHARJO MARKET</span><span className="mt-1 hidden text-[8px] text-white/55 sm:block">Produk lokal, pasar lebih luas</span></span></Link><nav className={(open ? "flex animate-fade-up " : "hidden ") + "absolute left-3 right-3 top-[79px] max-h-[calc(100vh-94px)] flex-col overflow-y-auto rounded-2xl border border-white/10 bg-forest-950 p-3 shadow-2xl md:static md:flex md:max-h-none md:flex-1 md:flex-row md:items-center md:justify-center md:gap-0.5 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-1"}>{links.map((item) => { const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={(active ? "bg-white/10 text-accent " : "text-white/80 ") + "flex items-center justify-between gap-1 whitespace-nowrap border-b border-white/10 px-3 py-3 text-[11px] leading-5 transition hover:text-accent md:rounded-full md:border-0 md:px-2 md:py-2 lg:px-2.5"}>{item.label}{item.dropdown && <ChevronDown size={12} className="opacity-70" />}</Link>; })}<div className="mt-2 grid gap-2 border-t border-white/10 pt-3 md:hidden"><Link href={accountHref} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-3 text-[11px] font-bold"><UserRound size={15} />{userName ? "Akun · " + userName : "Masuk atau daftar"}</Link><Link href="/lacak-pesanan" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-[11px] font-bold"><ClipboardList size={15} />Lacak pesanan</Link><Link href="/keranjang" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-[11px] font-bold"><ShoppingBag size={15} />Keranjang belanja</Link></div></nav><div className="ml-auto flex items-center gap-2"><Link href={accountHref} title={userName ? "Akun " + userName : "Masuk atau daftar"} className="group grid h-10 w-10 place-items-center rounded-full bg-accent text-forest-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><UserRound size={17} className="transition group-hover:scale-110" /></Link><CartDrawer /></div></div></header>;
}
