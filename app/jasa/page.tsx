import Link from "next/link";
import { ArrowRight, ClipboardList, MessageCircleMore, ShieldCheck } from "lucide-react";
import { ProductBrowser } from "@/components/product-browser";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicCatalog } from "@/lib/catalog-db";

export const revalidate = 30;

export default async function JasaPage() {
  const { entries, categories } = await getPublicCatalog();
  const services = entries.filter((entry) => entry.productType === "service");
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Layanan UMKM Kepuharjo" title="Temukan bantuan yang Anda perlukan." description={`${services.length} layanan tersedia di luar katalog produk. Sampaikan kebutuhan melalui formulir agar admin Forkom dapat membantu menghubungkan Anda dengan UMKM yang sesuai.`} /><div className="mb-8 grid gap-3 sm:grid-cols-3"><FlowCard icon={<ClipboardList size={18} />} title="1. Isi kebutuhan" copy="Ceritakan layanan, ukuran, jadwal, atau detail yang Anda perlukan." /><FlowCard icon={<MessageCircleMore size={18} />} title="2. Admin koordinasi" copy="Admin Forkom meneruskan kebutuhan kepada UMKM yang sesuai." /><FlowCard icon={<ShieldCheck size={18} />} title="3. Penawaran & pembayaran" copy="Harga disepakati terlebih dahulu sebelum transaksi layanan." /></div><ProductBrowser mode="service" entries={entries} categoryOptions={categories} /><div className="mt-10 rounded-3xl bg-forest-950 p-7 text-white sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-accent">Butuh bantuan memilih layanan?</p><h2 className="mt-2 font-display text-3xl font-bold">Mulai dari kebutuhan Anda.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/65">Jika belum yakin layanan mana yang sesuai, gunakan halaman bantuan untuk menghubungi pengelola.</p><Link href="/bantuan" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-[10px] font-bold text-forest-950">Buka pusat bantuan <ArrowRight size={14} className="ml-2" /></Link></div></main></SiteShell>;
}

function FlowCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card"><span className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-forest-800">{icon}</span><h2 className="mt-4 text-sm font-bold">{title}</h2><p className="mt-2 text-[11px] leading-5 text-muted">{copy}</p></div>; }
