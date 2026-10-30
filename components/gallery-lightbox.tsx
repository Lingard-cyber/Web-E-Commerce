"use client";

import { useEffect, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

export type GalleryLightboxImage = { id: string; src: string; alt: string; title: string };

export function GalleryLightbox({ images, variant = "gallery" }: { images: GalleryLightboxImage[]; variant?: "gallery" | "home" }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  const close = () => setActiveIndex(null);
  const move = (direction: -1 | 1) => setActiveIndex((current) => current === null || images.length < 2 ? current : (current + direction + images.length) % images.length);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null || images.length < 2 ? current : (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null || images.length < 2 ? current : (current + 1) % images.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length]);

  let touchStartX = 0;
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 55) move(delta > 0 ? -1 : 1);
  };

  return <>
    <div className={variant === "home" ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" : "grid auto-rows-[190px] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[170px]"}>
      {images.map((image, index) => <button key={image.id || image.src} type="button" onClick={() => setActiveIndex(index)} aria-label={`Lihat foto ${image.title}`} className={variant === "home" ? "group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e8f1eb] text-left shadow-card" : `group relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#dfece3] text-left shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl ${index === 0 ? "sm:col-span-2 sm:row-span-2" : index === 1 ? "lg:col-span-2" : ""}`}>
        <img src={image.src} alt={image.alt} loading={index < 2 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        {variant === "home" ? <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent p-4 pt-10 text-white"><p className="text-sm font-bold">{image.title}</p></div> : <><div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent opacity-80 transition group-hover:opacity-100" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5"><div className="min-w-0"><p className="mb-1 text-[9px] font-bold uppercase tracking-[.16em] text-accent">Dokumentasi {String(index + 1).padStart(2, "0")}</p><h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">{image.title}</h3>{image.alt && <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/80">{image.alt}</p>}</div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-sm transition group-hover:bg-accent group-hover:text-forest-950"><Images size={15} /></span></div></>}
      </button>)}
    </div>

    {activeImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={`Foto: ${activeImage.title}`} onClick={close} onTouchStart={(event) => { touchStartX = event.touches[0].clientX; }} onTouchEnd={handleTouchEnd}>
      <button type="button" onClick={close} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25" aria-label="Tutup foto"><X size={22} /></button>
      {images.length > 1 && <><button type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-6 sm:h-14 sm:w-14" aria-label="Foto sebelumnya"><ChevronLeft size={30} /></button><button type="button" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6 sm:h-14 sm:w-14" aria-label="Foto berikutnya"><ChevronRight size={30} /></button></>}
      <figure className="flex max-h-full max-w-full flex-col items-center" onClick={(event) => event.stopPropagation()}>
        <img src={activeImage.src} alt={activeImage.alt || activeImage.title} className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl sm:max-h-[82vh]" />
        <figcaption className="mt-3 max-w-3xl px-14 text-center text-sm leading-6 text-white sm:text-base"><strong className="block">{activeImage.title}</strong>{activeImage.alt && <span className="text-white/75">{activeImage.alt}</span>}<span className="mt-1 block text-xs text-white/60">{(activeIndex ?? 0) + 1} / {images.length}</span></figcaption>
      </figure>
    </div>}
  </>;
}
