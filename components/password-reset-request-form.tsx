"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/akun/reset-password`,
    });
    setLoading(false);
    if (error) return setMessage("Email belum dapat diproses. Periksa alamat email lalu coba lagi.");
    setSent(true);
    setMessage("Jika email terdaftar, tautan untuk membuat kata sandi baru sudah dikirim. Periksa inbox atau folder spam.");
  };

  return (
    <div className="animate-modal-in relative w-full rounded-2xl bg-white p-6 text-ink shadow-2xl sm:p-7">
      <Link href="/akun/login" className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-slate-100 hover:text-ink" aria-label="Kembali ke login"><ArrowLeft size={19} /></Link>
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
      {message && <p className={`mt-4 rounded-lg p-3 text-center text-[10px] leading-5 ${sent ? "bg-green-50 text-forest-800" : "bg-amber-50 text-amber-900"}`}>{message}</p>}
      <div className="my-5 border-t border-slate-200" />
      <p className="text-center text-[11px] text-muted">Ingat kata sandi? <Link href="/akun/login" className="font-bold text-forest-800 underline underline-offset-2">Kembali ke login</Link></p>
    </div>
  );
}
