import { ShieldCheck, Sparkles } from "lucide-react";
import { AdminLoginForm } from "../../../components/admin-login-form";

export default function AdminLoginPage() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";

  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#073f2f] px-4 py-8 sm:px-6">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(248,196,0,.2),transparent_24%),radial-gradient(circle_at_88%_80%,rgba(81,160,113,.25),transparent_30%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[url('/admin-umkm-illustration.jpg')] bg-cover bg-center opacity-[.13] mix-blend-screen" />
    <div className="hero-pattern pointer-events-none absolute inset-0 opacity-20" />
    <div className="admin-orbit pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-accent/10" />
    <div className="admin-orbit pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full border border-accent/10 [animation-delay:1.4s]" />
    <section className="admin-animate-in relative w-full max-w-[440px] rounded-[28px] border border-white/35 bg-[#fff9e9]/95 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
      <div className="relative h-28 overflow-hidden rounded-2xl bg-forest-950 p-5 text-white shadow-lg"><div className="absolute inset-0 bg-[url('/admin-umkm-illustration.jpg')] bg-cover bg-center opacity-55" /><div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/70 to-forest-800/20" /><div className="relative z-10 flex h-full flex-col justify-between"><span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-accent backdrop-blur"><Sparkles size={12} />Ruang kerja Forkom</span><p className="text-xs font-semibold text-white/85">Panel administrasi terpusat</p></div></div>
      <div className="px-1 pt-7 text-center"><span className="mx-auto grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-accent shadow-lg shadow-accent/20"><img src={`${storeUrl}/forkom-umkm-kepuharjo.jpg`} alt="Logo Forkom UMKM Kepuharjo" className="h-full w-full object-cover" /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Area terbatas</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-forest-950">Login Admin</h1><p className="mx-auto mt-2 max-w-[310px] text-xs leading-5 text-muted">Masuk menggunakan password admin yang sudah terdaftar pada sistem.</p></div>
      <AdminLoginForm />
      <div className="mt-7 flex items-start gap-2 rounded-2xl border border-forest-700/10 bg-forest-50/70 p-3 text-left text-[10px] leading-5 text-muted"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-forest-700" /><span>Akses ini khusus pengelola. Kata sandi dipakai hanya untuk proses masuk dan tidak ditampilkan kepada pengguna lain.</span></div>
    </section>
  </main>;
}
