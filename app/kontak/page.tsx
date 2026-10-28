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
        <section id="lokasi" className="mt-8">
          <div className="rounded-3xl bg-forest-950 px-6 py-7 text-white sm:px-10 sm:py-9">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">Lokasi Forkom UMKM Kepuharjo</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Dusun Pagerjurang, Kalurahan Kepuharjo, Kapanewon Cangkringan, Kabupaten Sleman.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">Lihat titik lokasi dan petunjuk menuju sekretariat komunitas melalui peta interaktif di bawah ini.</p>
          </div>
          <div className="relative mt-4 min-h-[430px] overflow-hidden rounded-3xl border border-slate-100 bg-[#e8f1eb] shadow-card sm:min-h-[500px]">
            <iframe src={embeddedMapUrl} title="Peta lokasi Forkom UMKM Kepuharjo" loading="lazy" className="absolute inset-0 h-full w-full border-0" referrerPolicy="no-referrer-when-downgrade" />
            <div className="absolute left-4 top-4 z-10 w-[min(300px,calc(100%-2rem))] rounded-2xl border border-slate-200 bg-white p-4 text-ink shadow-xl sm:left-6 sm:top-6 sm:p-5">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-forest-700"><MapPin size={19} /></span><div><p className="text-xs font-bold text-forest-950">FORKOM UMKM KEPUHARJO</p><p className="mt-1 text-[10px] leading-5 text-muted">Dusun Pagerjurang, Kalurahan Kepuharjo, Cangkringan, Sleman, Yogyakarta 55583.</p></div></div>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[#1a73e8] px-4 text-[10px] font-bold text-white">Buka di Maps <ArrowRight size={13} className="ml-2" /></a>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
