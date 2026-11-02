import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Instagram, MessageCircle, Package } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getPublicUmkmBySlug } from "@/lib/umkm-db";
import { orderingContacts, orderingWhatsappUrl } from "@/lib/ordering-contacts";

export const dynamic = "force-dynamic";

export default async function UmkmDetailPage({ params }: { params: { slug: string } }) {
  const umkm = await getPublicUmkmBySlug(params.slug);
  if (!umkm) notFound();

  const businessDetails = [
    ["Alamat usaha", umkm.contact.address],
    ["Jenis produk/jasa", umkm.businessType],
    ["NIB", umkm.permits.nib],
    ["Sertifikat halal", umkm.permits.halal],
    ["SPP-IRT", umkm.permits.sppirt],
  ].filter(([, value]) => Boolean(value?.trim()));
  const hasNarrative = Boolean(umkm.description.trim());

  return <SiteShell><main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-14">
    <Link href="/umkm" className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold text-forest-800 hover:underline"><ArrowLeft size={13} />Kembali ke daftar UMKM</Link>
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
      {umkm.profileImage && <div className="bg-slate-100"><img src={umkm.profileImage} alt={`Foto profil ${umkm.name}`} className="mx-auto max-h-[560px] w-full object-contain" /></div>}
      <div className="bg-forest-900 p-7 text-white sm:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">Profil UMKM Kepuharjo</p>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-none">{umkm.name}</h1>
        {hasNarrative && <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-7 text-white/70">{umkm.description}</p>}
        {umkm.contact.instagram && <a href={umkm.contact.instagram.startsWith("http") ? umkm.contact.instagram : `https://instagram.com/${umkm.contact.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[10px] text-white/75"><Instagram size={13} className="text-accent" />{umkm.contact.instagram}</a>}
      </div>
      <div className="p-6 sm:p-10">
        {(hasNarrative || businessDetails.length > 0) && <section className="rounded-2xl border border-forest-700/10 bg-[#f5f8f4] p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Profil usaha</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Tentang {umkm.name}</h2>
          {hasNarrative && <div className="mt-4"><h3 className="text-xs font-bold text-forest-800">Narasi profil</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted">{umkm.description}</p></div>}
          {businessDetails.length > 0 && <div className="mt-5"><h3 className="text-xs font-bold text-forest-800">Jenis produk dan perizinan</h3><dl className="mt-3 grid gap-3 sm:grid-cols-2">{businessDetails.map(([label, value]) => <div key={label}><dt className="text-[10px] font-bold text-forest-800">{label}</dt><dd className="mt-1 whitespace-pre-line text-xs leading-5 text-muted">{value}</dd></div>)}</dl></div>}
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold text-forest-800"><span className="rounded-full bg-white px-3 py-2">{umkm.productCount} produk/layanan ditampilkan</span><span className="rounded-full bg-white px-3 py-2">UMKM lokal Kepuharjo</span></div>
        </section>}
        <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Etalase usaha {umkm.name}</p><h2 className="mt-2 font-display text-3xl font-bold">Produk dan layanan</h2></div><span className="inline-flex items-center gap-2 text-[10px] font-bold text-muted"><Package size={14} />{umkm.productCount} pilihan</span></div>
        {umkm.products.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-center text-xs text-muted">Belum ada produk atau layanan yang ditayangkan.</p> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{umkm.products.map((product) => {
          const message = `Halo, saya tertarik dengan produk atau layanan ${product.name}. Mohon informasi cara pemesanannya.`;
          const detailHref = `/${product.productType === "service" ? "jasa" : "produk"}/${product.slug}`;
          return <article key={product.id} className="group rounded-2xl border border-slate-100 p-3 transition hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-md">
            <Link href={detailHref} className="flex gap-4">{product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-24 w-24 shrink-0 rounded-xl bg-[#e8f1eb] object-cover" />}<span className="min-w-0 py-1"><span className="block text-[9px] font-bold uppercase tracking-wide text-forest-700">{product.category}</span><strong className="mt-1 block text-sm leading-5 text-ink group-hover:text-forest-800">{product.name}</strong><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-forest-800">Lihat detail <ArrowUpRight size={12} /></span></span></Link>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">{orderingContacts.map((contact) => <a key={contact.number} href={orderingWhatsappUrl(contact.number, message)} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center justify-center rounded-lg bg-[#25D366] px-2 text-[9px] font-bold text-white"><MessageCircle size={12} className="mr-1" />{contact.label}</a>)}</div>
          </article>;
        })}</div>}
      </div>
    </section>
  </main></SiteShell>;
}
