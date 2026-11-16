"use client";

import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useState } from "react";
import type { CatalogImage } from "@/lib/catalog";

export function ProductGallery({ name, images }: { name: string; images: CatalogImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length ? images : [{ id: `${name}-placeholder`, imageUrl: "/placeholder-product.svg", altText: name }];
  const active = safeImages[activeIndex] || safeImages[0];
  const move = (offset: number) => setActiveIndex((current) => (current + offset + safeImages.length) % safeImages.length);

  return <div className="min-w-0 bg-[#eef5ef] p-3 sm:p-4"><div className="group relative aspect-square overflow-hidden rounded-2xl bg-green-50"><img key={active.id} src={active.imageUrl} alt={active.altText || name} fetchPriority={activeIndex === 0 ? "high" : "auto"} className="h-full w-full object-contain transition duration-300" />{safeImages.length > 1 && <><button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-forest-950 opacity-100 shadow-md transition sm:opacity-0 sm:group-hover:opacity-100" aria-label="Foto sebelumnya"><ChevronLeft size={17} /></button><button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-forest-950 opacity-100 shadow-md transition sm:opacity-0 sm:group-hover:opacity-100" aria-label="Foto berikutnya"><ChevronRight size={17} /></button><span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-forest-950/75 px-2.5 py-1.5 text-[9px] font-bold text-white"><Images size={12} />{activeIndex + 1}/{safeImages.length}</span></>}</div>{safeImages.length > 1 && <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Pilihan foto produk">{safeImages.map((image, index) => <button type="button" key={image.id} onClick={() => setActiveIndex(index)} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition sm:h-20 sm:w-20 ${index === activeIndex ? "border-forest-800 ring-2 ring-accent/60" : "border-transparent opacity-70 hover:opacity-100"}`} aria-label={`Lihat foto ${index + 1}`} aria-pressed={index === activeIndex}><img loading="lazy" src={image.imageUrl} alt={image.altText || `${name} foto ${index + 1}`} className="h-full w-full object-contain p-1" /></button>)}</div>}</div>;
}
