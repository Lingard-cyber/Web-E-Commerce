import Link from "next/link";
import { ArrowRight, UsersRound } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";

export default function UmkmPage() {
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Pelaku usaha" title="Kenali karya warga Kepuharjo." description="Kepuharjo Market menyiapkan ruang profil untuk pelaku UMKM, sehingga pengunjung dapat memahami cerita usaha sebelum berbelanja." /><div className="rounded-3xl bg-forest-900 p-7 text-white sm:p-12"><UsersRound size={28} className="mb-6 text-accent" /><h2 className="max-w-2xl font-display text-3xl font-bold">Profil UMKM akan diisi setelah data publik dikonfirmasi.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Nama usaha, deskripsi, alamat publik, kontak, jam operasional, dan foto pemilik belum tersedia secara terverifikasi di brief. Admin Forkom dapat mengelolanya melalui dashboard.</p><Link href="/bantuan" className="mt-7 inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-[10px] font-bold text-forest-900">Tanyakan informasi <ArrowRight size={13} className="ml-2" /></Link></div></main></SiteShell>;
}
