import { Quote } from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export default function SambutanLurahPage() {
  return <SiteShell><main className="mx-auto max-w-[920px] px-4 py-10 sm:px-6 sm:py-14"><div className="rounded-3xl bg-forest-950 p-7 text-white sm:p-14"><Quote size={32} className="text-accent" /><p className="mt-7 font-display text-[clamp(1.8rem,4vw,3.2rem)] font-bold leading-tight">Sambutan Lurah akan ditampilkan setelah naskah resmi, nama, jabatan, dan foto memperoleh persetujuan publikasi.</p><p className="mt-7 text-xs leading-6 text-white/55">Konten resmi diperlukan agar halaman ini tidak memuat informasi pemerintahan yang belum terverifikasi.</p></div></main></SiteShell>;
}
