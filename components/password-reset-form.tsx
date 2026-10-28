"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PasswordResetForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) return setMessage("Kata sandi minimal 8 karakter.");
    if (password !== confirmation) return setMessage("Konfirmasi kata sandi belum sama.");
    setLoading(true);
    setMessage("");
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setMessage("Kata sandi belum dapat diperbarui. Minta tautan reset baru lalu coba lagi.");
    setSuccess(true);
    setMessage("Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.");
  };

  return (
    <div className="animate-modal-in relative w-full rounded-2xl bg-white p-6 text-ink shadow-2xl sm:p-7">
      <Link href="/akun/login" className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-slate-100 hover:text-ink" aria-label="Kembali ke login"><ArrowLeft size={19} /></Link>
      <div className="pt-1 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800">Pemulihan akun</span>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold leading-tight text-forest-900">Buat kata sandi baru</h1>
        <p className="mt-2 text-xs leading-5 text-muted">Gunakan kata sandi baru yang kuat untuk mengamankan akun Anda.</p>
      </div>
      {!success ? <form onSubmit={submit} className="mt-7 space-y-4">
        <PasswordField label="Kata sandi baru" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
        <PasswordField label="Ulangi kata sandi baru" value={confirmation} onChange={setConfirmation} show={showConfirmation} onToggle={() => setShowConfirmation((value) => !value)} />
        <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white shadow-[0_8px_16px_rgba(3,61,45,.18)] transition hover:-translate-y-0.5 hover:bg-forest-700 disabled:cursor-wait disabled:opacity-60"><LockKeyhole size={14} className="mr-2" />{loading ? "Menyimpan..." : "Simpan kata sandi"}</button>
      </form> : <div className="mt-7 rounded-xl bg-green-50 p-4 text-center text-xs text-forest-800"><CheckCircle2 size={22} className="mx-auto mb-2" />{message}</div>}
      {!success && message && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-[10px] leading-5 text-amber-900">{message}</p>}
      {success && <Link href="/akun/login" className="mt-5 flex h-11 items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white">Masuk dengan kata sandi baru</Link>}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void }) {
  return <label className="block text-[11px] font-bold text-ink">{label}<div className="relative mt-1.5"><LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={value} onChange={(event) => onChange(event.target.value)} required minLength={8} type={show ? "text" : "password"} autoComplete="new-password" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] px-9 pr-10 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Minimal 8 karakter" /><button type="button" onClick={onToggle} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-green-50 hover:text-forest-800" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>;
}
