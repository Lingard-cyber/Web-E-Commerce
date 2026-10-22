import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, FileWarning } from "lucide-react";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { SiteShell } from "@/components/site-shell";
import { catalogEntries, catalogImagePlaceholder, formatRupiah, getCatalogEntry } from "@/lib/catalog";

export function generateStaticParams() { return catalogEntries.map((entry) => ({ slug: entry.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata { const entry = getCatalogEntry(params.slug); return { title: entry ? `${entry.name} | Kepuharjo Market` : "Produk | Kepuharjo Market", description: entry?.description }; }

export default function ProductPage({ params }: { params: { slug: string } }) {
  const entry = getCatalogEntry(params.slug);
  if (!entry) notFound();
  return <SiteShell><main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-14"><div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card md:grid-cols-[.9fr_1.1fr]"><div className="min-h-[340px] bg-green-50"><img src={entry.imageSrc || catalogImagePlaceholder} alt={entry.imageAlt} className="h-full w-full object-cover" /></div><div className="p-6 sm:p-10"><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest-700">{entry.category} · {entry.productType === "service" ? "Jasa" : "Barang"}</p><h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-none">{entry.name}</h1><p className="mt-4 text-sm leading-7 text-muted">{entry.description}</p><div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-5 text-amber-950"><FileWarning size={16} className="mb-2 text-amber-700" /><strong>Belum siap ditransaksikan</strong><br />{entry.verificationNote || "Harga, stok, foto, dan status tayang masih menunggu verifikasi admin Forkom."}</div><div className="mt-6 space-y-2">{entry.variants.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"><span className="text-xs">{item.label}</span><strong className="text-sm text-forest-800">{formatRupiah(item.priceIdr)}</strong></div>)}</div><div className="mt-4 flex items-center gap-2 text-[10px] text-muted"><CheckCircle2 size={14} className="text-forest-700" />Stok tersedia akan ditampilkan setelah admin mengisinya.</div><ProductDetailActions entry={entry} /></div></div></main></SiteShell>;
}
