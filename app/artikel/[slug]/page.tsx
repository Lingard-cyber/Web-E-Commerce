import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";

export default function ArtikelDetailPage({ params }: { params: { slug: string } }) {
  if (!params.slug) notFound();
  return <SiteShell><main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-14"><article className="rounded-3xl border border-slate-100 bg-white p-7 shadow-card sm:p-12"><p className="text-[10px] font-bold uppercase tracking-widest text-forest-700">Artikel</p><h1 className="mt-3 font-display text-4xl font-bold">Artikel belum dipublikasikan.</h1><p className="mt-4 text-sm leading-7 text-muted">Halaman ini akan berisi artikel yang telah disetujui admin Forkom.</p></article></main></SiteShell>;
}
