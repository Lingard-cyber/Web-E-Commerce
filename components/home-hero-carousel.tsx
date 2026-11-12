"use client";

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

  if (!slides.length) return <div className="absolute inset-0 overflow-hidden rounded-[22px] bg-[url('/kepuharjo-mountain.jpg')] bg-cover bg-center after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(3,61,45,.96)_0%,rgba(3,61,45,.83)_30%,rgba(3,61,45,.28)_67%,rgba(3,61,45,.05)_100%)] sm:rounded-[28px] lg:after:bg-[linear-gradient(90deg,rgba(3,61,45,1)_0%,rgba(3,61,45,1)_42%,rgba(3,61,45,.78)_52%,rgba(3,61,45,0)_69%)]" aria-hidden="true" />;
  const slide = slides[active % slides.length];

  return <div className="absolute inset-0 z-0 overflow-visible">
    <div className="absolute inset-0 overflow-hidden rounded-[22px] sm:rounded-[28px]">
      <img key={slide.id} src={slide.src} alt={slide.alt} className="h-full w-full object-cover object-center animate-fade-up lg:absolute lg:right-0 lg:w-[58%]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(3,61,45,.96)_0%,rgba(3,61,45,.83)_30%,rgba(3,61,45,.28)_67%,rgba(3,61,45,.05)_100%)] lg:bg-[linear-gradient(90deg,rgba(3,61,45,1)_0%,rgba(3,61,45,1)_42%,rgba(3,61,45,.78)_52%,rgba(3,61,45,0)_69%)]" />
    </div>
    {slides.length > 1 && <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} aria-label={`Tampilkan foto ${index + 1}`} aria-current={index === active} className={`h-2.5 rounded-full transition-all ${index === active ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`} />)}</div>}
  </div>;
}
