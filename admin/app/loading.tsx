export default function AdminLoading() {
  return <div className="admin-interface min-h-screen bg-[#f4f7f3] text-ink" role="status" aria-live="polite" aria-label="Memuat halaman admin">
    <div className="flex min-h-screen">
      <aside className="hidden w-[270px] shrink-0 border-r border-slate-200 bg-white/80 p-5 lg:block">
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-8 space-y-3">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}</div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-7">
        <p className="text-xs font-semibold text-forest-800">Memuat halaman admin…</p>
        <div className="mt-4 h-9 max-w-sm animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-3 h-5 max-w-xl animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />)}</div>
        <div className="mt-5 h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
      </main>
    </div>
  </div>;
}
