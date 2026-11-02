"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, CreditCard, Images, LayoutDashboard, Menu, MessageSquareText, Moon, PackageCheck, Sun, Tags, UsersRound, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { AdminLogout } from "@/components/admin-logout";

const nav = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Manajemen Produk", "/admin/produk", Boxes],
  ["Kategori", "/admin/kategori", Tags],
  ["Manajemen Jasa", "/admin/jasa", MessageSquareText],
  ["Data UMKM", "/admin/umkm", UsersRound],
  ["Galeri", "/admin/galeri", Images],
  ["Pesanan Produk", "/admin/pesanan-produk", ClipboardList],
  ["Pembayaran", "/admin/pembayaran", CreditCard],
  ["Laporan", "/admin/laporan", BarChart3],
] as const;

export function AdminShell({ children, name, email }: { children: ReactNode; name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? "/admin";
  const toAdminPath = (href: string) => href === "/admin" ? (basePath || "/") : `${basePath}${href.replace("/admin", "")}`;

  useEffect(() => {
    setDarkMode(window.localStorage.getItem("admin-theme") === "dark");
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("admin-theme", next ? "dark" : "light");
      return next;
    });
  };

  return <div className={`${darkMode ? "admin-theme-dark" : ""} admin-interface admin-backdrop relative min-h-screen overflow-hidden text-ink`}>
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true"><span className="absolute bottom-12 right-[34%] h-2 w-2 rounded-full bg-accent/70 shadow-[0_0_0_10px_rgba(248,196,0,.08)]" /></div>
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[min(270px,calc(100vw-1rem))] overflow-y-auto border-r border-white/70 bg-white/90 p-4 pb-6 shadow-[14px_0_40px_rgba(21,67,45,.08)] backdrop-blur-xl transition-transform sm:p-5 lg:translate-x-0`}>
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/30 bg-white shadow-lg shadow-forest-950/15"><img src="/forkom-umkm-kepuharjo.jpg" alt="Logo Forkom UMKM Kepuharjo" className="h-full w-full object-cover" /></span><span><strong className="block text-sm">Forkom Admin</strong><small className="text-[10px] text-muted">Operasional terpusat</small></span><span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.12)]" title="Sistem aktif" /><button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white/80 text-slate-600 transition hover:bg-slate-100 hover:text-ink lg:hidden" aria-label="Tutup sidebar admin" title="Tutup menu"><X size={17} /></button></div>
      <nav className="mt-6 space-y-1">{nav.map(([label, href, Icon]) => { const resolvedHref = toAdminPath(href); const active = href === "/admin" ? pathname === resolvedHref : pathname.startsWith(resolvedHref); return <Link key={href} href={resolvedHref} onClick={() => setOpen(false)} className={`${active ? "bg-forest-950 text-white shadow-lg shadow-forest-950/15" : "text-slate-600 hover:bg-green-50 hover:text-forest-800"} group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold`}><Icon size={16} className="transition-transform group-hover:scale-110" />{label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}</Link>; })}</nav>
      <div className="mt-6 rounded-2xl border border-forest-700/10 bg-forest-50/70 p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-forest-800"><PackageCheck size={14} />Panel operasional</div><p className="mt-2 text-[10px] leading-5 text-muted">Pantau katalog, transaksi, dan koordinasi UMKM dari satu tempat.</p></div>
      <div className="mt-6 border-t border-slate-100 pt-4"><AdminLogout /></div>
    </aside>
    <div className="relative z-10 min-w-0 lg:pl-[270px]">
      <header className="sticky top-0 z-30 flex min-h-[72px] min-w-0 items-center justify-between border-b border-white/70 bg-white/80 px-3 shadow-sm shadow-forest-950/5 backdrop-blur-xl sm:px-7"><button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/70 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Buka menu admin">{open ? <X size={18} /> : <Menu size={18} />}</button><div className="flex min-w-0 items-center gap-2"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm"><img src="/forkom-umkm-kepuharjo.jpg" alt="Logo Forkom UMKM Kepuharjo" className="h-full w-full object-cover" /></span><div className="hidden min-w-0 sm:block"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Dashboard Admin Forkom</p><p className="mt-1 max-w-[min(48vw,42rem)] text-base leading-5 text-slate-700">Kelola katalog, order, jasa, dan laporan dari satu tempat.</p></div></div><div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3"><button type="button" onClick={toggleTheme} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/70 text-forest-800 transition hover:bg-green-50" aria-label={darkMode ? "Aktifkan mode siang" : "Aktifkan mode malam"} title={darkMode ? "Mode siang" : "Mode malam"}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button><span className="hidden min-w-0 text-right sm:block"><strong className="block truncate text-xs">{name}</strong><small className="block max-w-[220px] truncate text-[10px] text-muted">Admin aktif</small></span><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-forest-950 shadow-lg shadow-accent/20">{name.slice(0, 1).toUpperCase()}</span></div></header>
      <main className="mx-auto min-w-0 w-full max-w-[1500px] p-3 sm:p-5 lg:p-7">{children}</main>
    </div>
    {open && <button className="fixed inset-0 z-30 bg-forest-950/30 backdrop-blur-[2px] lg:hidden" aria-label="Tutup menu" onClick={() => setOpen(false)} />}
  </div>;
}
