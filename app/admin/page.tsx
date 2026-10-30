import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Store } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminDashboardData } from "@/components/admin-dashboard-data";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();

  return <AdminShell name={admin.name} email={admin.email}>
    <section className="admin-hero admin-shimmer admin-animate-in rounded-[28px] p-6 text-white sm:p-8 lg:p-10">
      <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-accent"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10"><Store size={14} /></span>Ringkasan operasional</div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Selamat datang, {admin.name}.</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/90">Satu ruang kerja untuk menjaga katalog, pesanan, dan kolaborasi UMKM tetap bergerak.</p>
        </div>
        <Link href="/" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-accent px-4 text-xs font-bold text-forest-950 shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-yellow-300">Lihat storefront <ArrowRight size={14} className="ml-2" /></Link>
      </div>
      <div className="relative z-10 mt-8 flex flex-wrap gap-2 text-[10px] text-white/70"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Produk & stok</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Jasa & konsultasi</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">Pembayaran tervalidasi</span></div>
    </section>
    <Suspense fallback={<DashboardDataLoading />}><AdminDashboardData /></Suspense>
  </AdminShell>;
}

function DashboardDataLoading() {
  return <div className="mt-6" role="status" aria-label="Memuat ringkasan data">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />)}</div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/80 shadow-sm" />)}</div>
    <div className="mt-7 h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
  </div>;
}
