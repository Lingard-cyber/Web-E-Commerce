import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicGallery } from "@/lib/gallery-db";

export const revalidate = 30;

export default async function GaleriPage() {
  const galleryImages = await getPublicGallery();
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14">
    <PageHeading eyebrow="Galeri Kepuharjo" title="Cerita warga dalam foto." description="Dokumentasi kegiatan, kebersamaan, dan karya pelaku UMKM Kepuharjo." action={{ label: "Kembali ke beranda", href: "/" }} />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{galleryImages.map((image) => <a key={image.src} href={image.src} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-xl"><div className="relative aspect-[4/3] overflow-hidden bg-[#e8f1eb]"><img src={image.src} alt={image.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-forest-950/75 text-white"><ExternalLink size={15} /></span></div><div className="p-5"><h2 className="font-display text-xl font-bold text-ink">{image.title}</h2><p className="mt-2 text-xs text-muted">Buka foto ukuran penuh</p></div></a>)}</div>
    <Link href="/" className="mt-8 inline-flex items-center text-xs font-bold text-forest-800 hover:underline"><ArrowLeft size={14} className="mr-2" />Kembali ke beranda</Link>
  </main></SiteShell>;
}
