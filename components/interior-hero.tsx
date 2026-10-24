type InteriorHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
};

export function InteriorHero({ eyebrow, title, description, image = "/kepuharjo-mountain.jpg" }: InteriorHeroProps) {
  return <section className="relative isolate left-1/2 mb-8 min-h-[calc(100vh-105px)] w-screen -translate-x-1/2 overflow-hidden bg-forest-950 text-white">
    <img src={image} alt="Ilustrasi pegunungan dan hutan Kepuharjo" className="absolute inset-0 h-full w-full object-cover object-center" />
    <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/75 to-forest-950/25" />
    <div className="hero-pattern pointer-events-none absolute inset-0 opacity-15" />
    <div className="relative mx-auto flex min-h-[calc(100vh-105px)] max-w-[1240px] items-end px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-forest-950">{eyebrow}</p>
        <h1 className="font-display text-[clamp(2.3rem,5vw,4.8rem)] font-bold leading-[.94] tracking-[-.04em]">{title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75">{description}</p>
      </div>
    </div>
  </section>;
}
