"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
type HomeHeroSlide = { id: string; src: string; alt: string; title: string; isHero: boolean; sortOrder: number };

export function HomeHeroCarousel({ images }: { images: HomeHeroSlide[] }) {
  const [active, setActive] = useState(0);
  const selectedSlides = images.filter((image) => image.isHero);
  const slides = selectedSlides.length ? selectedSlides : images;
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % Math.max(slides.length, 1)), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[active % slides.length];
  const next = () => setActive((value) => (value + 1) % slides.length);
  const previous = () => setActive((value) => (value - 1 + slides.length) % slides.length);

  return <div className="absolute inset-x-[3%] -top-6 overflow-hidden rounded-[28px] border border-white/20 bg-white/[.08] shadow-[20px_22px_0_rgba(0,0,0,.16)] backdrop-blur-sm sm:-top-10">
    <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#fff8e9] p-2 sm:p-3">
      <img key={slide.id} src={slide.src} alt={slide.alt} className="h-full w-full object-cover object-center animate-fade-up" />
      <div className="absolute right-4 top-4 flex gap-1.5"><button type="button" onClick={previous} className="grid h-8 w-8 place-items-center rounded-full bg-forest-950/55 text-white" aria-label="Slide promo sebelumnya"><ChevronLeft size={14} /></button><button type="button" onClick={next} className="grid h-8 w-8 place-items-center rounded-full bg-forest-950/55 text-white" aria-label="Slide promo berikutnya"><ChevronRight size={14} /></button></div>
      <div className="absolute bottom-5 left-5 max-w-[75%] rounded-xl bg-forest-950/70 px-3 py-2 text-white"><p className="text-xs font-bold">{slide.title}</p>{slide.alt && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/80">{slide.alt}</p>}</div><div className="absolute bottom-5 right-5 rounded-full bg-forest-950/55 px-2.5 py-1.5 text-[9px] font-bold text-white">{active + 1}/{slides.length}</div>
    </div>
  </div>;
}
