export default function AdminLoading() {
  return <main className="min-h-screen bg-[#f4f7f3] p-4 text-forest-950 sm:p-7" role="status" aria-live="polite" aria-label="Memuat dashboard admin">
    <p className="text-sm font-semibold">Menyiapkan dashboard admin…</p>
    <div className="mt-5 grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden space-y-3 rounded-2xl bg-white p-5 shadow-sm lg:block">
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        {Array.from({ length: 7 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}
      </aside>
      <section className="min-w-0">
        <div className="h-48 animate-pulse rounded-[28px] bg-forest-900 sm:h-56" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />)}</div>
        <div className="mt-5 h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
      </section>
    </div>
  </main>;
}
