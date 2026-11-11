"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
type HomeHeroSlide = { id: string; src: string; alt: string; title: string; isHero: boolean; sortOrder: number };

export function HomeHeroCarousel({ images }: { images: HomeHeroSlide[] }) {
  const [active, setActive] = useState(0);
  const selectedSlides = images.filter((image) => image.isHero);
  const slides = selectedSlides.length ? selectedSlides : images;
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return <div className="absolute inset-0 bg-[url('/kepuharjo-mountain.jpg')] bg-cover bg-center after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(3,61,45,.96)_0%,rgba(3,61,45,.83)_30%,rgba(3,61,45,.28)_67%,rgba(3,61,45,.05)_100%)]" aria-hidden="true" />;
  const slide = slides[active % slides.length];
  const next = () => setActive((value) => (value + 1) % slides.length);
  const previous = () => setActive((value) => (value - 1 + slides.length) % slides.length);

  return <div className="absolute inset-0 z-0 overflow-hidden">
    <img key={slide.id} src={slide.src} alt={slide.alt} className="h-full w-full object-cover object-center animate-fade-up" />
    <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(3,61,45,.96)_0%,rgba(3,61,45,.83)_30%,rgba(3,61,45,.28)_67%,rgba(3,61,45,.05)_100%)]" />
    {slides.length > 1 && <>
      <button type="button" onClick={previous} className="absolute left-4 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-forest-950 shadow-md hover:bg-white sm:left-5" aria-label="Foto sebelumnya"><ChevronLeft size={19} /></button>
      <button type="button" onClick={next} className="absolute right-4 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-forest-950 shadow-md hover:bg-white sm:right-5" aria-label="Foto berikutnya"><ChevronRight size={19} /></button>
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} aria-label={`Tampilkan foto ${index + 1}`} aria-current={index === active} className={`h-2.5 rounded-full transition-all ${index === active ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`} />)}</div>
    </>}
  </div>;
}
