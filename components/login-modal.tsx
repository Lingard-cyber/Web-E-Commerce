"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [onClose, open]);

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const result = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (result.error) return setMessage(getAuthErrorMessage(result.error.message));
      const syncResponse = await fetch("/api/auth/sync", { method: "POST" });
      if (!syncResponse.ok) return setMessage("Login berhasil, tetapi profil belum tersinkron. Silakan coba lagi.");
      onClose();
      router.refresh();
    } catch {
      setMessage("Login belum berhasil. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/65 px-4 py-6 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="login-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="animate-modal-in relative w-full max-w-[390px] rounded-2xl bg-white p-6 text-ink shadow-2xl sm:p-7">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-slate-100 hover:text-ink" aria-label="Tutup login"><X size={19} /></button>
      <div className="pr-8"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Akun Kepuharjo Market</p><h2 id="login-modal-title" className="mt-2 font-display text-3xl font-bold">Masuk</h2><p className="mt-2 text-xs leading-5 text-muted">Masuk untuk menyimpan keranjang dan melihat pesanan Anda.</p></div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-[10px] font-bold">Email<div className="relative mt-1.5"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-normal outline-none focus:border-forest-700 focus:ring-4 focus:ring-green-50" /></div></label>
        <label className="block text-[10px] font-bold">Kata sandi<div className="relative mt-1.5"><LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 8 karakter" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-9 pr-11 text-xs font-normal outline-none focus:border-forest-700 focus:ring-4 focus:ring-green-50" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-green-50 hover:text-forest-800" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
        <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center rounded-xl bg-forest-800 text-[11px] font-bold text-white transition hover:bg-forest-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Memeriksa..." : "Masuk ke akun"}</button>
      </form>
      {message && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-[10px] leading-5 text-amber-900">{message}</p>}
      <div className="mt-5 border-t border-slate-100 pt-5 text-center text-[10px] text-muted">Belum memiliki akun? <Link href="/akun/daftar" onClick={onClose} className="font-bold text-forest-800 hover:underline">Daftar sekarang</Link></div>
    </div>
  </div>;
}
