import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Camera, Images } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getPublicGallery } from "@/lib/gallery-db";

export const revalidate = 30;

export default async function GaleriPage() {
  const galleryImages = await getPublicGallery();

  return (
    <SiteShell>
      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-forest-950 px-6 py-8 text-white shadow-card sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-accent"><Camera size={14} /> Galeri Kepuharjo</p>
              <h1 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[.95] tracking-[-.04em]">Cerita warga dalam foto.</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">Dokumentasi kegiatan, kebersamaan, dan karya pelaku UMKM Kepuharjo yang terus tumbuh bersama.</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-forest-950"><Images size={19} /></span>
              <span><strong className="block font-display text-2xl leading-none">{galleryImages.length}</strong><span className="mt-1 block text-[10px] text-white/60">dokumentasi pilihan</span></span>
            </div>
          </div>
        </section>

        {galleryImages.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-forest-700/25 bg-white px-6 py-20 text-center text-sm text-muted">Belum ada foto yang ditampilkan.</div> : <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Dokumentasi pilihan</p><h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">Momen dari Kepuharjo</h2></div><span className="rounded-full bg-white px-3 py-2 text-[10px] font-bold text-muted shadow-sm">Geser untuk melihat lebih banyak</span></div>
          <div className="grid auto-rows-[190px] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[170px]">
            {galleryImages.map((image, index) => <a key={image.src} href={image.src} target="_blank" rel="noreferrer" className={`group relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#dfece3] shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl ${index === 0 ? "sm:col-span-2 sm:row-span-2" : index === 1 ? "lg:col-span-2" : ""}`}>
              <img src={image.src} alt={image.alt} loading={index < 2 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent opacity-80 transition group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5"><div><p className="mb-1 text-[9px] font-bold uppercase tracking-[.16em] text-accent">Dokumentasi {String(index + 1).padStart(2, "0")}</p><h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">{image.title}</h3></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-sm transition group-hover:bg-accent group-hover:text-forest-950"><ArrowUpRight size={15} /></span></div>
            </a>)}
          </div>
        </section>}

        <Link href="/" className="mt-8 inline-flex items-center rounded-full border border-forest-700/15 bg-white px-4 py-2.5 text-xs font-bold text-forest-800 shadow-sm transition hover:-translate-y-0.5 hover:border-forest-700/30 hover:shadow-md"><ArrowLeft size={14} className="mr-2" />Kembali ke beranda</Link>
      </main>
    </SiteShell>
  );
}
