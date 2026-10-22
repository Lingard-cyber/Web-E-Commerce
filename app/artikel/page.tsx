import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";

export default function ArtikelPage() {
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Cerita dan kabar" title="Artikel Kepuharjo Market" description="Ruang untuk cerita produk, kegiatan UMKM, dan kabar pengelolaan etalase bersama." /><div className="rounded-3xl border border-dashed border-forest-700/30 bg-white p-10 text-center shadow-card"><Newspaper size={28} className="mx-auto text-forest-700" /><h2 className="mt-5 font-display text-2xl font-bold">Belum ada artikel yang dipublikasikan.</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">Konten artikel akan dikelola admin Forkom melalui dashboard setelah naskah, foto, dan status publikasinya dikonfirmasi.</p><Link href="/bantuan" className="mt-6 inline-flex items-center text-[11px] font-bold text-forest-800">Hubungi pengelola <ArrowRight size={13} className="ml-2" /></Link></div></main></SiteShell>;
}
