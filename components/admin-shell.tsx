"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, CreditCard, LayoutDashboard, Menu, MessageSquareText, PackageCheck, Store, UsersRound, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { AdminLogout } from "@/components/admin-logout";

const nav = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Manajemen Produk", "/admin/produk", Boxes],
  ["Manajemen Jasa", "/admin/jasa", MessageSquareText],
  ["Data UMKM", "/admin/umkm", UsersRound],
  ["Pesanan Produk", "/admin/pesanan-produk", ClipboardList],
  ["Pembayaran", "/admin/pembayaran", CreditCard],
  ["Laporan", "/admin/laporan", BarChart3],
] as const;

export function AdminShell({ children, name, email }: { children: ReactNode; name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? "/admin";
  const toAdminPath = (href: string) => href === "/admin" ? (basePath || "/") : `${basePath}${href.replace("/admin", "")}`;

  return <div className="admin-backdrop relative min-h-screen overflow-hidden text-ink">
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true"><span className="admin-orbit absolute -left-16 top-28 h-40 w-40 rounded-full border border-forest-700/10" /><span className="admin-orbit absolute right-[8%] top-24 h-24 w-24 rounded-full border border-accent/25 [animation-delay:1.2s]" /><span className="absolute bottom-12 right-[34%] h-2 w-2 rounded-full bg-accent/70 shadow-[0_0_0_10px_rgba(248,196,0,.08)]" /></div>
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[min(270px,calc(100vw-1rem))] overflow-y-auto border-r border-white/70 bg-white/90 p-4 pb-6 shadow-[14px_0_40px_rgba(21,67,45,.08)] backdrop-blur-xl transition-transform sm:p-5 lg:translate-x-0`}>
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-950 text-accent shadow-lg shadow-forest-950/15"><Store size={19} /></span><span><strong className="block text-sm">Forkom Admin</strong><small className="text-[10px] text-muted">Operasional terpusat</small></span><span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.12)]" title="Sistem aktif" /></div>
      <nav className="mt-6 space-y-1">{nav.map(([label, href, Icon]) => { const resolvedHref = toAdminPath(href); const active = href === "/admin" ? pathname === resolvedHref : pathname.startsWith(resolvedHref); return <Link key={href} href={resolvedHref} onClick={() => setOpen(false)} className={`${active ? "bg-forest-950 text-white shadow-lg shadow-forest-950/15" : "text-slate-600 hover:bg-green-50 hover:text-forest-800"} group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold`}><Icon size={16} className="transition-transform group-hover:scale-110" />{label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}</Link>; })}</nav>
      <div className="mt-6 rounded-2xl border border-forest-700/10 bg-forest-50/70 p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-forest-800"><PackageCheck size={14} />Panel operasional</div><p className="mt-2 text-[10px] leading-5 text-muted">Pantau katalog, transaksi, dan koordinasi UMKM dari satu tempat.</p></div>
      <div className="mt-6 border-t border-slate-100 pt-4"><AdminLogout /></div>
    </aside>
    <div className="relative z-10 min-w-0 lg:pl-[270px]">
      <header className="sticky top-0 z-30 flex min-h-[72px] min-w-0 items-center justify-between border-b border-white/70 bg-white/80 px-3 shadow-sm shadow-forest-950/5 backdrop-blur-xl sm:px-7"><button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/70 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Buka menu admin">{open ? <X size={18} /> : <Menu size={18} />}</button><div className="hidden min-w-0 lg:block"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Dashboard Admin Forkom</p><p className="mt-1 truncate text-xs text-muted">Kelola katalog, order, jasa, dan laporan dari satu tempat.</p></div><div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3"><span className="hidden min-w-0 text-right sm:block"><strong className="block truncate text-xs">{name}</strong><small className="block max-w-[220px] truncate text-[10px] text-muted">{email}</small></span><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-forest-950 shadow-lg shadow-accent/20">{name.slice(0, 1).toUpperCase()}</span></div></header>
      <main className="mx-auto min-w-0 w-full max-w-[1500px] p-3 sm:p-5 lg:p-7">{children}</main>
    </div>
    {open && <button className="fixed inset-0 z-30 bg-forest-950/30 backdrop-blur-[2px] lg:hidden" aria-label="Tutup menu" onClick={() => setOpen(false)} />}
  </div>;
}
