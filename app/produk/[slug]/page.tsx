import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardList, FileText, PackageCheck, Truck } from "lucide-react";
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-4 border-b border-slate-100 py-3 last:border-0"><dt className="w-28 shrink-0 text-[10px] text-muted sm:w-36">{label}</dt><dd className="text-xs font-semibold text-forest-950">{value}</dd></div>;
}

function buildDetailedDescription(entry: Awaited<ReturnType<typeof getPublicProduct>>, typeLabel: string) {
  if (!entry) return { intro: "", source: "", handling: "" };
  const source = entry.description.trim();
  const producer = entry.producer ? ` dari ${entry.producer}` : " dari pelaku usaha lokal Kepuharjo";
  const intro = `${entry.name} merupakan ${typeLabel.toLowerCase()}${producer} pada kategori ${entry.category}.`;
  const handling = entry.productType === "service"
    ? "Detail kebutuhan, ruang lingkup pekerjaan, dan harga akan disesuaikan melalui konsultasi dengan penyedia layanan."
    : entry.productType === "fresh_preorder"
      ? "Produk disiapkan berdasarkan pesanan. Ketersediaan, waktu produksi, dan jadwal pengiriman perlu dikonfirmasi sebelum checkout dibuka."
      : "Ketersediaan produk dan jumlah stok mengikuti varian yang dipilih serta konfirmasi pemenuhan dari pengelola.";
  return { intro, source, handling };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const entry = await getPublicProduct(params.slug);
  if (!entry) notFound();
  const isService = entry.productType === "service";
  const images = entry.images?.length ? entry.images : [{ id: `${entry.id}-primary`, imageUrl: entry.imageSrc || catalogImagePlaceholder, altText: entry.imageAlt }];
  const activeVariants = entry.variants.filter((variant) => variant.active);
  const lowestPrice = activeVariants.reduce<number | null>((lowest, variant) => variant.priceIdr !== null && (lowest === null || variant.priceIdr < lowest) ? variant.priceIdr : lowest, null);
  const typeLabel = isService ? "Jasa / layanan" : entry.productType === "fresh_preorder" ? "Produk segar / pre-order" : "Produk kemasan";
  const detailedDescription = buildDetailedDescription(entry, typeLabel);

  return <SiteShell><main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-14">
    <div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card md:grid-cols-[.9fr_1.1fr]">
      <ProductGallery name={entry.name} images={images} />
      <div className="p-6 sm:p-10"><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest-700">{entry.category} · {typeLabel}</p><h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-none">{entry.name}</h1>{entry.producer && <p className="mt-3 text-xs font-bold text-forest-700">Dari {entry.producer}</p>}<p className="mt-4 text-sm leading-7 text-muted">{entry.description}</p>{isService ? <ServiceInquiryForm productSlug={entry.slug} /> : <ProductDetailActions entry={entry} />}</div>
    </div>

    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card lg:grid lg:grid-cols-[1.25fr_.75fr]">
      <section id="informasi-produk" className="p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-forest-700"><FileText size={18} /></span><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Deskripsi lengkap</p><h2 className="mt-1 font-display text-2xl font-bold">Kenali {isService ? "layanan ini" : "produk ini"}</h2></div></div><div className="mt-7 space-y-6"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-forest-700">Tentang {isService ? "layanan" : "produk"}</p><p className="mt-2 text-sm leading-7 text-ink">{detailedDescription.intro}</p></div><div className="border-t border-slate-100 pt-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-forest-700">Deskripsi</p><p className="mt-2 text-sm leading-7 text-muted">{detailedDescription.source}</p></div><div className="rounded-2xl border border-accent/30 bg-accent/10 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-forest-800">Catatan pemenuhan</p><p className="mt-2 text-sm leading-7 text-forest-950">{detailedDescription.handling}</p></div></div><div className="mt-8 border-t border-slate-100 pt-6"><h3 className="text-sm font-bold text-forest-950">Informasi yang perlu diketahui</h3><dl className="mt-3"><DetailRow label="Kategori" value={entry.category} /><DetailRow label="Jenis" value={typeLabel} /><DetailRow label={isService ? "Penyedia jasa" : "Pelaku usaha"} value={entry.producer || "Belum dipetakan"} /><DetailRow label={isService ? "Cara pesan" : "Pilihan"} value={isService ? (entry.serviceBookingMode === "direct_booking" ? "Pemesanan langsung" : "Konsultasi / penawaran") : `${activeVariants.length} varian tersedia`} /></dl></div>{isService && <div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Kebutuhan", entry.serviceRequirements], ["Ketersediaan", entry.serviceAvailability], ["Estimasi waktu", entry.serviceDuration]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-100 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-forest-700">{label}</p><p className="mt-2 text-xs leading-5 text-muted">{value || "Dikonfirmasi saat konsultasi"}</p></div>)}</div>}</section>
      <aside className="h-full bg-forest-950 p-6 text-white sm:p-8 lg:sticky lg:top-24 lg:self-start"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-accent">Ringkasan {isService ? "layanan" : "pembelian"}</p><h2 className="mt-3 font-display text-2xl font-bold leading-tight">{isService ? "Siapkan kebutuhan Anda." : "Pilih sesuai kebutuhan."}</h2><div className="mt-7 space-y-5 text-sm leading-6 text-white/75"><p className="flex items-start gap-3"><PackageCheck size={16} className="mt-1 shrink-0 text-accent" /><span>{isService ? "Jelaskan ukuran, jumlah, bahan, jadwal, atau referensi yang dibutuhkan." : `${activeVariants.length} varian dapat dipilih sebelum menentukan jumlah.`}</span></p><p className="flex items-start gap-3"><ClipboardList size={16} className="mt-1 shrink-0 text-accent" /><span>{isService ? "Admin akan membantu meneruskan kebutuhan kepada penyedia jasa." : lowestPrice !== null ? `Harga mulai ${formatRupiah(lowestPrice)} dan dihitung ulang sesuai varian serta jumlah.` : "Harga dikonfirmasi oleh admin sebelum pesanan diproses."}</span></p><p className="flex items-start gap-3"><Truck size={16} className="mt-1 shrink-0 text-accent" /><span>Detail pengiriman, pengambilan, atau jadwal layanan dikonfirmasi sebelum pemenuhan.</span></p></div></aside>
    </div>
  </main></SiteShell>;
}
