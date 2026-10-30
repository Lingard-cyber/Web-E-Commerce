"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(result.error || "Permintaan reset belum dapat diproses."); return; }
      setSent(true);
      setMessage("Jika email terdaftar, tautan untuk membuat kata sandi baru sudah dikirim. Periksa inbox atau folder spam.");
    } catch {
      setMessage("Koneksi ke layanan autentikasi gagal. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-modal-in relative w-full overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-6 text-ink shadow-[0_24px_70px_rgba(2,40,29,.24)] sm:p-7">
      <Link href="/akun/login" className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white" aria-label="Kembali ke login"><ArrowLeft size={19} /></Link>
      <div className="-mx-6 -mt-6 mb-6 bg-gradient-to-br from-forest-900 via-forest-800 to-emerald-600 px-6 pb-6 pt-16 text-white sm:-mx-7 sm:-mt-7 sm:px-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-white/30 bg-white/15"><img src="/forkom-umkm-kepuharjo.jpg" alt="Logo Forkom UMKM Kepuharjo" className="h-full w-full object-cover" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/70">FORKOM UMKM KEPUHARJO</p><p className="mt-1 font-display text-xl font-bold">Pemulihan akun</p></div></div><p className="mt-4 max-w-xs text-[11px] leading-5 text-white/75">Kami akan mengirim tautan aman untuk membuat kata sandi baru.</p></div>
      <div className="pt-1 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800">Pemulihan akun</span>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold leading-tight text-forest-900">Lupa kata sandi?</h1>
        <p className="mt-2 text-xs leading-5 text-muted">Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.</p>
      </div>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block text-[11px] font-bold text-ink">Alamat Email
          <div className="relative mt-1.5"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" disabled={sent} className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50 disabled:opacity-60" placeholder="nama@email.com" /></div>
        </label>
        <button type="submit" disabled={loading || sent} className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white shadow-[0_8px_16px_rgba(3,61,45,.18)] transition hover:-translate-y-0.5 hover:bg-forest-700 disabled:cursor-wait disabled:opacity-60"><Send size={14} className="mr-2" />{loading ? "Mengirim..." : sent ? "Tautan sudah dikirim" : "Kirim tautan reset"}</button>
      </form>
      {message && <p role="status" className={`mt-4 rounded-lg p-3 text-center text-[10px] leading-5 ${sent ? "bg-green-50 text-forest-800" : "bg-amber-50 text-amber-900"}`}>{message}</p>}
      {sent && <button type="button" onClick={() => { setSent(false); setMessage(""); }} className="mt-3 block w-full text-center text-[10px] font-bold text-forest-800 underline underline-offset-2">Gunakan email lain atau kirim ulang</button>}
      <div className="my-5 border-t border-slate-200" />
      <p className="text-center text-[11px] text-muted">Ingat kata sandi? <Link href="/akun/login" className="font-bold text-forest-800 underline underline-offset-2">Kembali ke login</Link></p>
    </div>
  );
}
