import Link from "next/link";
import { ArrowRight, Instagram, MapPin, UsersRound } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicUmkm } from "@/lib/umkm-db";

export const dynamic = "force-dynamic";

export default async function UmkmPage() {
  const umkm = await getPublicUmkm();

  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14">
    <PageHeading eyebrow="Pelaku usaha" title="Kenali karya warga Kepuharjo." description="Temukan cerita usaha, produk, dan layanan lokal sebelum memilih kebutuhan Anda." />
    {umkm.length === 0 ? <div className="rounded-3xl bg-forest-900 p-7 text-white sm:p-12"><UsersRound size={28} className="mb-6 text-accent" /><h2 className="max-w-2xl font-display text-3xl font-bold">Profil UMKM sedang kami siapkan.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Data usaha belum tersedia untuk ditampilkan. Silakan kembali lagi atau lihat produk yang sudah tersedia di katalog.</p><Link href="/belanja" className="mt-7 inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-[10px] font-bold text-forest-900">Lihat katalog <ArrowRight size={13} className="ml-2" /></Link></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{umkm.map((item) => { const firstProduct = item.products[0]; const profileImage = item.profileImage || firstProduct?.imageUrl; return <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-xl"><div className="relative aspect-[1.7/1] overflow-hidden bg-[#e8f1eb]">{profileImage && <img src={profileImage} alt={item.profileImage ? `Foto profil ${item.name}` : `Produk dari ${item.name}`} className="h-full w-full object-cover object-center" />}<div className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-transparent to-transparent" /><span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-bold text-forest-800">{item.productCount} produk/layanan</span></div><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">UMKM Kepuharjo</p><h2 className="mt-2 font-display text-2xl font-bold">{item.name}</h2>{item.description && <p className="mt-3 line-clamp-3 text-xs leading-6 text-muted">{item.description}</p>}{item.contact.address && <p className="mt-3 flex items-start gap-2 text-[10px] leading-5 text-muted"><MapPin size={13} className="mt-0.5 shrink-0 text-forest-700" /><span>{item.contact.address}</span></p>}{item.contact.instagram && <div className="mt-4 grid gap-2 text-[10px] text-muted"><span className="flex items-center gap-2"><Instagram size={13} className="shrink-0 text-forest-700" />{item.contact.instagram}</span></div>}<Link href={`/umkm/${item.slug}`} className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white hover:bg-forest-700">Lihat profil usaha <ArrowRight size={13} className="ml-2" /></Link></div></article>; })}</div>}
  </main></SiteShell>;
}
