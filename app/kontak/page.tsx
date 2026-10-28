import Link from "next/link";
import { ArrowRight, HelpCircle, MapPin, MessageCircle } from "lucide-react";
import { InteriorHero } from "@/components/interior-hero";
import { SiteShell } from "@/components/site-shell";

const whatsappNumber = "6285600604388";
const whatsappMessage = encodeURIComponent("Halo Kepuharjo Market, saya ingin bertanya tentang produk.");
const mapUrl = "https://www.google.com/maps?q=-7.6250023,110.4530898&z=17&hl=en";
const embeddedMapUrl = `${mapUrl}&output=embed`;

export default function KontakPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14">
        <InteriorHero
          eyebrow="Hubungi kami"
          title="Ada yang ingin ditanyakan?"
          description="Tim pengelola siap membantu pertanyaan tentang produk, jasa, pesanan, dan informasi UMKM."
        />
        <section className="grid gap-4 md:grid-cols-3">
          <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="group rounded-3xl bg-forest-900 p-6 text-white shadow-card transition hover:-translate-y-1 hover:shadow-xl sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#25D366] text-white"><MessageCircle size={21} /></span>
            <h2 className="mt-6 font-display text-2xl font-bold">WhatsApp admin</h2>
            <p className="mt-2 text-xs leading-6 text-white/65">Kirim pertanyaan langsung melalui WhatsApp.</p>
            <span className="mt-6 inline-flex items-center text-[10px] font-bold text-accent">Buka WhatsApp <ArrowRight size={14} className="ml-2 transition group-hover:translate-x-1" /></span>
          </a>
          <a href={mapUrl} target="_blank" rel="noreferrer" className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-xl sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-green-50 text-forest-700"><MapPin size={21} /></span>
            <h2 className="mt-6 font-display text-2xl font-bold">Lokasi komunitas</h2>
            <p className="mt-2 text-xs leading-6 text-muted">Kalurahan Kepuharjo, Kapanewon Cangkringan, Kabupaten Sleman, Daerah Istimewa Yogyakarta.</p>
            <span className="mt-6 inline-flex items-center text-[10px] font-bold text-forest-800">Buka lokasi di Google Maps <ArrowRight size={14} className="ml-2 transition group-hover:translate-x-1" /></span>
          </a>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700"><HelpCircle size={21} /></span>
            <h2 className="mt-6 font-display text-2xl font-bold">Pusat bantuan</h2>
            <p className="mt-2 text-xs leading-6 text-muted">Baca jawaban singkat tentang katalog, pembelian, jasa, dan pesanan.</p>
            <Link href="/bantuan" className="mt-6 inline-flex items-center text-[10px] font-bold text-forest-800">Lihat bantuan <ArrowRight size={14} className="ml-2" /></Link>
          </div>
        </section>
        <section id="lokasi" className="mt-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
          <div className="grid lg:grid-cols-[.8fr_1.2fr]">
            <div className="flex flex-col justify-center bg-forest-950 p-7 text-white sm:p-10">
              <MapPin size={28} className="text-accent" />
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-accent">Lokasi Forkom UMKM Kepuharjo</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight">Temukan kami di peta.</h2>
              <p className="mt-4 text-sm leading-7 text-white/65">Lihat titik lokasi dan petunjuk menuju Kalurahan Kepuharjo melalui peta interaktif.</p>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 w-fit items-center rounded-xl bg-accent px-4 text-[10px] font-bold text-forest-950">Buka di Google Maps <ArrowRight size={14} className="ml-2" /></a>
            </div>
            <div className="min-h-[360px] bg-[#e8f1eb] sm:min-h-[440px]">
              <iframe src={embeddedMapUrl} title="Peta lokasi Forkom UMKM Kepuharjo" loading="lazy" className="h-full min-h-[360px] w-full border-0 sm:min-h-[440px]" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
