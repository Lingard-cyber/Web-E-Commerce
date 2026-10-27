"use client";

import { useState } from "react";
import { formatAdminRupiah } from "@/lib/admin-data";

type SalesPoint = { label: string; orders: number; revenue: number };

export function AdminSalesChart({ data }: { data: SalesPoint[] }) {
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const active = data[activeIndex] || { label: "-", orders: 0, revenue: 0 };

  return <section className="admin-animate-in rounded-2xl border border-white/80 bg-white/85 p-5 shadow-[0_12px_35px_rgba(24,66,45,.07)] backdrop-blur sm:p-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Performa penjualan</p><h2 className="mt-1 font-display text-xl font-bold">Ringkasan 6 bulan terakhir</h2><p className="mt-1 text-xs text-muted">Pendapatan hanya menghitung pesanan dengan pembayaran tervalidasi.</p></div>
      <div className="flex gap-5 text-right"><div><strong className="block text-lg text-forest-950">{formatAdminRupiah(totalRevenue)}</strong><span className="text-[10px] text-muted">Total pendapatan</span></div><div><strong className="block text-lg text-forest-950">{totalOrders}</strong><span className="text-[10px] text-muted">Total pesanan</span></div></div>
    </div>
    <div className="mt-6 rounded-2xl bg-forest-950 p-4 text-white sm:p-5">
      <div className="flex items-center justify-between gap-3"><div><span className="text-[10px] text-white/55">Bulan dipilih</span><strong className="mt-1 block font-display text-2xl">{active.label}</strong></div><div className="text-right"><span className="text-[10px] text-white/55">Pendapatan</span><strong className="mt-1 block text-sm text-accent">{formatAdminRupiah(active.revenue)}</strong><span className="text-[10px] text-white/55">{active.orders} pesanan</span></div></div>
      <div className="mt-6 flex h-44 items-end gap-2 sm:gap-4" role="img" aria-label="Grafik pendapatan enam bulan terakhir">
        {data.map((item, index) => { const height = item.revenue ? Math.max((item.revenue / maxRevenue) * 100, 8) : 5; const selected = index === activeIndex; return <button type="button" key={`${item.label}-${index}`} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} className="group flex h-full min-w-0 flex-1 flex-col justify-end focus:outline-none" aria-label={`${item.label}: ${formatAdminRupiah(item.revenue)}, ${item.orders} pesanan`}><span className={`mb-2 truncate text-[9px] text-white/65 transition ${selected ? "text-accent" : "opacity-0 group-hover:opacity-100"}`}>{item.orders} order</span><span className={`block w-full rounded-t-lg transition-all duration-300 ${selected ? "bg-accent shadow-[0_0_22px_rgba(248,196,0,.35)]" : "bg-white/20 group-hover:bg-white/40"}`} style={{ height: `${height}%` }} /><span className={`mt-2 text-[10px] ${selected ? "font-bold text-accent" : "text-white/55"}`}>{item.label}</span></button>; })}
      </div>
    </div>
  </section>;
}
