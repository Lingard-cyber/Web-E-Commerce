import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { ProductGallery } from "@/components/product-gallery";
import { ProductInfoTabs } from "@/components/product-info-tabs";
import { SiteShell } from "@/components/site-shell";
import { catalogImagePlaceholder, formatRupiah } from "@/lib/catalog-utils";
import { getPublicProduct } from "@/lib/catalog-db";
import { orderingContacts, orderingWhatsappUrl } from "@/lib/ordering-contacts";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const entry = await getPublicProduct(params.slug);
  return { title: entry ? `${entry.name} | Kepuharjo Market` : "Produk | Kepuharjo Market", description: entry?.description };
}

function buildDetailedDescription(entry: Awaited<ReturnType<typeof getPublicProduct>>, typeLabel: string) {
  if (!entry) return { intro: "", source: "" };
  const source = entry.description.trim();
  const producer = entry.producer ? ` dari ${entry.producer}` : " dari pelaku usaha lokal Kepuharjo";
  const intro = `${entry.name} merupakan ${typeLabel.toLowerCase()}${producer} pada kategori ${entry.category}.`;
  return { intro, source };
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
  const purchaseSummary = [
    isService ? "Jelaskan ukuran, jumlah, bahan, jadwal, atau referensi yang dibutuhkan." : `${activeVariants.length} varian dapat dipilih sebelum menentukan jumlah.`,
    isService ? "Admin akan membantu meneruskan kebutuhan kepada penyedia jasa." : lowestPrice !== null ? `Harga mulai ${formatRupiah(lowestPrice)} dan dihitung ulang sesuai varian serta jumlah.` : "Harga dikonfirmasi oleh admin sebelum pesanan diproses.",
    "Detail pengiriman, pengambilan, atau jadwal layanan dikonfirmasi sebelum pemenuhan.",
  ];

  return <SiteShell><main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-14">
    <div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card md:grid-cols-[.9fr_1.1fr]">
      <ProductGallery name={entry.name} images={images} />
      <div className="p-6 sm:p-10"><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest-700">{entry.category} · {typeLabel}</p><h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-none">{entry.name}</h1>{entry.producer && <p className="mt-3 text-xs font-bold text-forest-700">Dari {entry.producer}</p>}<p className="mt-4 text-base leading-7 text-slate-700">{entry.description}</p>{isService ? <div className="mt-7 rounded-2xl border border-accent/40 bg-accent/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Harga jasa / layanan</p><p className="mt-2 font-display text-2xl font-bold text-forest-950">{lowestPrice !== null ? `Mulai ${formatRupiah(lowestPrice)}` : "Hubungi penyedia untuk penawaran harga"}</p><p className="mt-2 text-xs leading-5 text-muted">Harga akhir menyesuaikan detail pekerjaan, bahan, ukuran, jumlah, dan jadwal layanan.</p></div> : <ProductDetailActions entry={entry} />}</div>
    </div>

    {isService && <section className="mt-6 rounded-3xl border border-forest-700/10 bg-white p-6 shadow-card sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Pesan melalui WhatsApp</p><h2 className="mt-2 font-display text-2xl font-bold text-forest-950">Hubungi penyedia layanan</h2><p className="mt-2 text-xs leading-5 text-muted">Pilih salah satu nomor untuk menanyakan detail jasa atau membuat pesanan.</p></div><MessageCircle className="hidden text-[#25D366] sm:block" size={32} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{orderingContacts.map((contact) => <a key={contact.number} href={orderingWhatsappUrl(contact.number, `Halo, saya tertarik dengan layanan ${entry.name}. Mohon informasi selengkapnya.`)} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs font-bold text-white transition hover:bg-[#1ebe5d]"><MessageCircle size={16} />{contact.display}</a>)}</div></section>}

    <ProductInfoTabs isService={isService} intro={detailedDescription.intro} description={detailedDescription.source} purchaseSummary={purchaseSummary} />
  </main></SiteShell>;
}
