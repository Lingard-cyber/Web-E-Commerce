"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const promoSlides = [
  { id: "promo-kuliner", image: "/promo-contoh-kuliner.jpg", alt: "Promo kuliner UMKM" },
  { id: "promo-fashion", image: "/promo-contoh-fashion.jpg", alt: "Promo fashion dan event UMKM" },
];

export function HomeHeroCarousel() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % promoSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = promoSlides[active];
  const next = () => setActive((value) => (value + 1) % promoSlides.length);
  const previous = () => setActive((value) => (value - 1 + promoSlides.length) % promoSlides.length);

  return <div className="absolute inset-x-[3%] -top-6 overflow-hidden rounded-[28px] border border-white/20 bg-white/[.08] shadow-[20px_22px_0_rgba(0,0,0,.16)] backdrop-blur-sm sm:-top-10">
    <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#fff8e9] p-2 sm:p-3">
      <img key={slide.id} src={slide.image} alt={slide.alt} className="h-full w-full object-contain object-center animate-fade-up" />
      <div className="absolute right-4 top-4 flex gap-1.5"><button type="button" onClick={previous} className="grid h-8 w-8 place-items-center rounded-full bg-forest-950/55 text-white" aria-label="Slide promo sebelumnya"><ChevronLeft size={14} /></button><button type="button" onClick={next} className="grid h-8 w-8 place-items-center rounded-full bg-forest-950/55 text-white" aria-label="Slide promo berikutnya"><ChevronRight size={14} /></button></div>
      <div className="absolute bottom-5 right-5 rounded-full bg-forest-950/55 px-2.5 py-1.5 text-[9px] font-bold text-white">{active + 1}/{promoSlides.length}</div>
    </div>
  </div>;
}
