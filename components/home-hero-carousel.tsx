"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CatalogEntry, catalogImagePlaceholder } from "@/lib/catalog";

export function HomeHeroCarousel({ entries }: { entries: CatalogEntry[] }) {
  const slides = useMemo(() => entries.filter((entry) => entry.imageSrc || entry.images?.length).slice(0, 6), [entries]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  if (!slides.length) return <div className="absolute inset-x-[3%] top-0 overflow-hidden rounded-[28px] border border-white/20 bg-white/[.08] shadow-[20px_22px_0_rgba(0,0,0,.16)]"><img src={catalogImagePlaceholder} alt="Katalog produk lokal Kepuharjo" className="aspect-[4/5] h-full w-full object-cover" /></div>;
  const entry = slides[active] || slides[0];
  const image = entry.images?.[0]?.imageUrl || entry.imageSrc || catalogImagePlaceholder;
  const next = () => setActive((value) => (value + 1) % slides.length);
  const previous = () => setActive((value) => (value - 1 + slides.length) % slides.length);
  return <div className="absolute inset-x-[3%] top-0 overflow-hidden rounded-[28px] border border-white/20 bg-white/[.08] shadow-[20px_22px_0_rgba(0,0,0,.16)] backdrop-blur-sm">
    <div className="relative aspect-[4/5] overflow-hidden bg-forest-800">
      <img key={image} src={image} alt={entry.imageAlt || entry.name} className="h-full w-full object-cover opacity-90 animate-fade-up" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/10 to-transparent" />
      <div className="absolute inset-x-5 bottom-5">
        <p className="text-[9px] font-bold uppercase tracking-[.18em] text-accent">Pilihan lokal minggu ini</p>
        <p className="mt-1 max-w-[80%] font-display text-2xl font-bold leading-tight sm:text-3xl">{entry.name}</p>
        <p className="mt-1 text-[10px] text-white/70">{entry.category}</p>
        <Link href={`/produk/${entry.slug}`} className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold text-forest-900 hover:bg-accent">Lihat detail <ArrowUpRight size={12} /></Link>
      </div>
      {slides.length > 1 && <div className="absolute right-4 top-4 flex gap-1.5"><button type="button" onClick={previous} className="grid h-8 w-8 place-items-center rounded-full bg-forest-950/55 text-white" aria-label="Slide sebelumnya"><ChevronLeft size={14} /></button><button type="button" onClick={next} className="grid h-8 w-8 place-items-center rounded-full bg-forest-950/55 text-white" aria-label="Slide berikutnya"><ChevronRight size={14} /></button></div>}
      {slides.length > 1 && <div className="absolute bottom-5 right-5 rounded-full bg-forest-950/55 px-2.5 py-1.5 text-[9px] font-bold text-white">{active + 1}/{slides.length}</div>}
    </div>
  </div>;
}
