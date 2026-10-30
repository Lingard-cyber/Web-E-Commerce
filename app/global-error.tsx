"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="id"><body><main className="grid min-h-screen place-items-center bg-[#f5f8f4] px-4 py-10 font-sans text-slate-900">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">Forkom UMKM Kepuharjo</p>
      <h1 className="mt-4 text-2xl font-bold">Halaman belum dapat dibuka</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Silakan coba lagi atau buka halaman untuk meminta tautan reset kata sandi yang baru.</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2"><button onClick={reset} className="min-h-11 rounded-xl bg-emerald-900 px-4 text-xs font-bold text-white">Coba lagi</button><Link href="/akun/lupa-password" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 px-4 text-xs font-bold text-emerald-900">Minta tautan baru</Link></div>
    </section>
  </main></body></html>;
}
