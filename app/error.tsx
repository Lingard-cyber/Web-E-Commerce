"use client";

import Link from "next/link";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#f5f8f4] px-4 py-10">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-card">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-forest-700">Forkom UMKM Kepuharjo</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-forest-950">Halaman belum dapat dibuka</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Terjadi gangguan saat memuat halaman. Silakan muat ulang atau minta tautan reset kata sandi yang baru.</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <button onClick={reset} className="min-h-11 rounded-xl bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-700">Muat ulang halaman</button>
        <Link href="/akun/lupa-password" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-forest-200 px-4 text-xs font-bold text-forest-800 hover:bg-green-50">Minta tautan baru</Link>
      </div>
    </section>
  </main>;
}
