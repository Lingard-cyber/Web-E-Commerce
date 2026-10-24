import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, FileWarning } from "lucide-react";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { ProductGallery } from "@/components/product-gallery";
import { ServiceInquiryForm } from "@/components/service-inquiry-form";
import { SiteShell } from "@/components/site-shell";
import { catalogImagePlaceholder, formatRupiah } from "@/lib/catalog";
import { getPublicProduct } from "@/lib/catalog-db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const entry = await getPublicProduct(params.slug);
  return { title: entry ? `${entry.name} | Kepuharjo Market` : "Produk | Kepuharjo Market", description: entry?.description };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const entry = await getPublicProduct(params.slug);
  if (!entry) notFound();
  const isService = entry.productType === "service";
  const images = entry.images?.length ? entry.images : [{ id: `${entry.id}-primary`, imageUrl: entry.imageSrc || catalogImagePlaceholder, altText: entry.imageAlt }];
  return <SiteShell><main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-14"><div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card md:grid-cols-[.9fr_1.1fr]"><ProductGallery name={entry.name} images={images} /><div className="p-6 sm:p-10"><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest-700">{entry.category} · {isService ? "Jasa" : "Barang"}</p><h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-none">{entry.name}</h1>{entry.producer && <p className="mt-3 text-xs font-bold text-forest-700">Dari {entry.producer}</p>}<p className="mt-4 text-sm leading-7 text-muted">{entry.description}</p><div className={`mt-6 rounded-2xl border p-4 text-[11px] leading-5 ${entry.status === "published" ? "border-green-200 bg-green-50 text-forest-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}><FileWarning size={16} className="mb-2 text-amber-700" /><strong>{isService ? "Layanan melalui konsultasi" : entry.status === "published" ? "Siap dipesan" : "Informasi sedang dilengkapi"}</strong><br />{entry.verificationNote || (entry.status === "published" ? "Harga dan stok tersedia untuk proses pemesanan." : "Informasi harga, stok, foto, atau jadwal masih dilengkapi agar pesanan dapat diproses dengan jelas.")}</div><div className="mt-6 space-y-2">{entry.variants.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"><span className="text-xs">{item.label}</span><strong className="text-sm text-forest-800">{formatRupiah(item.priceIdr)}</strong></div>)}</div>{isService ? <ServiceInquiryForm productSlug={entry.slug} /> : <><div className="mt-4 flex items-center gap-2 text-[10px] text-muted"><CheckCircle2 size={14} className="text-forest-700" />{entry.status === "published" ? "Stok dan harga akan dicek kembali saat checkout." : "Produk dapat dibeli setelah informasi pentingnya lengkap."}</div><ProductDetailActions entry={entry} /></>}</div></div></main></SiteShell>;
}
