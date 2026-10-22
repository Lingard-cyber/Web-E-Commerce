import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { categories } from "@/lib/catalog";

export default function KategoriPage() {
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Jelajahi berdasarkan kebutuhan" title="Kategori produk dan jasa" description="Mulai dari makanan rumahan, minuman herbal, kerajinan, sampai jasa jahit warga Kepuharjo." /><div className="grid gap-4 sm:grid-cols-2">{categories.map((category, index) => <Link key={category.slug} href={`/kategori/${category.slug}`} className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-xl"><div className="mb-8 flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${index % 2 ? "bg-green-50 text-forest-800" : "bg-amber-50 text-amber-700"}`}><Package size={19} /></span><ArrowRight size={17} className="text-muted transition group-hover:translate-x-1 group-hover:text-forest-800" /></div><h2 className="font-display text-2xl font-bold">{category.name}</h2><p className="mt-2 text-sm leading-6 text-muted">{category.description}</p><p className="mt-5 text-[10px] font-bold uppercase tracking-widest text-forest-700">{category.count} entri katalog</p></Link>)}</div></main></SiteShell>;
}
