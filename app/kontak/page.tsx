import Link from "next/link";
import { ArrowRight, HelpCircle, MapPin, MessageCircle } from "lucide-react";
import { InteriorHero } from "@/components/interior-hero";
import { SiteShell } from "@/components/site-shell";

const whatsappNumber = "6281234567890";
const whatsappMessage = encodeURIComponent("Halo Kepuharjo Market, saya ingin bertanya tentang produk.");

export default function KontakPage() {
  return <SiteShell><main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14">
    <InteriorHero eyebrow="Hubungi kami" title="Ada yang ingin ditanyakan?" description="Tim pengelola siap membantu pertanyaan tentang produk, jasa, pesanan, dan informasi UMKM." />
    <section className="grid gap-4 md:grid-cols-3">
      <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="group rounded-3xl bg-forest-900 p-6 text-white shadow-card transition hover:-translate-y-1 hover:shadow-xl sm:p-7">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#25D366] text-white"><MessageCircle size={21} /></span>
        <h2 className="mt-6 font-display text-2xl font-bold">WhatsApp admin</h2>
        <p className="mt-2 text-xs leading-6 text-white/65">Kirim pertanyaan langsung melalui WhatsApp.</p>
        <span className="mt-6 inline-flex items-center text-[10px] font-bold text-accent">Buka WhatsApp <ArrowRight size={14} className="ml-2 transition group-hover:translate-x-1" /></span>
      </a>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-7">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-green-50 text-forest-700"><MapPin size={21} /></span>
        <h2 className="mt-6 font-display text-2xl font-bold">Lokasi komunitas</h2>
        <p className="mt-2 text-xs leading-6 text-muted">Kalurahan Kepuharjo, Kapanewon Cangkringan, Kabupaten Sleman, Daerah Istimewa Yogyakarta.</p>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-7">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700"><HelpCircle size={21} /></span>
        <h2 className="mt-6 font-display text-2xl font-bold">Pusat bantuan</h2>
        <p className="mt-2 text-xs leading-6 text-muted">Baca jawaban singkat tentang katalog, pembelian, jasa, dan pesanan.</p>
        <Link href="/bantuan" className="mt-6 inline-flex items-center text-[10px] font-bold text-forest-800">Lihat bantuan <ArrowRight size={14} className="ml-2" /></Link>
      </div>
    </section>
  </main></SiteShell>;
}
