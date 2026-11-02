"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole, LoaderCircle, Mail } from "lucide-react";
import { useEffect, useState } from "react";

type ResetState = "checking" | "ready" | "invalid" | "updated";

export function PasswordResetForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<ResetState>("checking");
  const [accountEmail, setAccountEmail] = useState("");
  const [invalidReason, setInvalidReason] = useState("Tautan mungkin sudah kedaluwarsa atau sudah pernah digunakan. Minta tautan baru untuk melanjutkan.");

  useEffect(() => {
    let mounted = true;
    const checkRecovery = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "expired") {
        if (mounted) {
          setInvalidReason("Tautan reset sudah kedaluwarsa. Minta tautan reset baru agar dapat membuat kata sandi baru.");
          setState("invalid");
        }
        return;
      }
      if (params.get("error") === "invalid") {
        if (mounted) {
          setInvalidReason("Tautan reset tidak valid, sudah pernah dipakai, atau tidak cocok dengan email akun.");
          setState("invalid");
        }
        return;
      }
      try {
        const response = await fetch("/api/auth/password-reset/confirm", { cache: "no-store" });
        const result = await response.json().catch(() => ({}));
        if (!mounted) return;
        if (!response.ok || !result.email) {
          setState("invalid");
          if (response.status === 403) setInvalidReason("Halaman ini hanya bisa dibuka melalui tautan reset yang dikirim ke email Anda.");
          return;
        }
        setAccountEmail(result.email);
        setState("ready");
      } catch {
        if (mounted) {
          setInvalidReason("Koneksi ke layanan autentikasi gagal. Minta tautan reset baru lalu coba lagi.");
          setState("invalid");
        }
      }
    };
    void checkRecovery();
    return () => { mounted = false; };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) return setMessage("Kata sandi minimal 8 karakter.");
    if (password !== confirmation) return setMessage("Konfirmasi kata sandi belum sama.");
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || "Kata sandi belum dapat diperbarui.");
        if (response.status === 401 || response.status === 403) setState("invalid");
        return;
      }
      setState("updated");
      setMessage("Kata sandi berhasil diperbarui. Silakan masuk kembali dengan email akun Anda.");
    } catch {
      setMessage("Koneksi ke layanan autentikasi gagal. Coba lagi atau minta tautan reset baru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-modal-in relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-5 text-ink shadow-[0_24px_70px_rgba(2,40,29,.24)] sm:p-6">
      <div className="-mx-5 -mt-5 mb-5 bg-gradient-to-br from-forest-900 via-forest-800 to-emerald-600 px-5 pb-5 pt-6 text-white sm:-mx-6 sm:-mt-6 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-white/30 bg-white/15"><img src="/forkom-umkm-kepuharjo.jpg" alt="Logo Forkom UMKM Kepuharjo" className="h-full w-full object-cover" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/70">FORKOM UMKM KEPUHARJO</p><p className="mt-1 font-display text-xl font-bold">Atur ulang kata sandi</p></div></div><p className="mt-3 max-w-xs text-[11px] leading-5 text-white/75">Buat kata sandi baru untuk menjaga akun Anda tetap aman.</p></div>
      <div className="pt-1 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800">Pemulihan akun</span>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold leading-tight text-forest-900">Buat kata sandi baru</h1>
        <p className="mt-2 text-xs leading-5 text-muted">Masukkan dan konfirmasi kata sandi baru untuk akun Anda.</p>
      </div>
      {state === "checking" && <div className="mt-7 rounded-xl border border-slate-100 bg-[#f5f8f4] p-5 text-center text-xs text-muted"><LoaderCircle size={22} className="mx-auto mb-2 animate-spin text-forest-700" />Memeriksa tautan pemulihan akun...</div>}
      {state === "invalid" && <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center"><AlertCircle size={26} className="mx-auto mb-3 text-amber-700" /><p className="text-sm font-bold text-amber-900">Tautan reset tidak dapat digunakan</p><p className="mt-2 text-[11px] leading-5 text-amber-900/80">{invalidReason}</p><Link href="/akun/lupa-password" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-forest-800 px-4 text-[11px] font-bold text-white hover:bg-forest-700">Kirim tautan reset baru</Link></div>}
      {state === "ready" && <form onSubmit={submit} className="mt-6 space-y-3">
        <label className="block text-[11px] font-bold text-ink">Email akun pada tautan<div className="relative mt-1.5"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={accountEmail} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-normal text-muted" /></div></label>
        <PasswordField label="Kata sandi baru" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
        <PasswordField label="Ulangi kata sandi baru" value={confirmation} onChange={setConfirmation} show={showConfirmation} onToggle={() => setShowConfirmation((value) => !value)} />
        <p className="rounded-lg bg-[#f5f8f4] p-3 text-[10px] leading-5 text-muted">Gunakan minimal 8 karakter. Jangan gunakan kata sandi yang sama dengan akun lain.</p>
        <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white shadow-[0_8px_16px_rgba(3,61,45,.18)] transition hover:-translate-y-0.5 hover:bg-forest-700 disabled:cursor-wait disabled:opacity-60"><LockKeyhole size={14} className="mr-2" />{loading ? "Menyimpan..." : "Simpan kata sandi"}</button>
      </form>}
      {state === "updated" && <div className="mt-7 rounded-xl bg-green-50 p-4 text-center text-xs text-forest-800"><CheckCircle2 size={22} className="mx-auto mb-2" />{message}</div>}
      {state === "ready" && message && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-[10px] leading-5 text-amber-900">{message}</p>}
      {state === "updated" && <Link href="/akun/login?reset=1" className="mt-5 flex h-11 items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white">Masuk dengan kata sandi baru</Link>}
      {state !== "updated" && <p className="mt-5 text-center text-[11px] text-muted">Ingin mulai dari awal? <Link href="/akun/login" className="font-bold text-forest-800 underline underline-offset-2">Kembali ke login</Link></p>}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void }) {
  return <label className="block text-[11px] font-bold text-ink">{label}<div className="relative mt-1.5"><LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={value} onChange={(event) => onChange(event.target.value)} required minLength={8} type={show ? "text" : "password"} autoComplete="new-password" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] px-9 pr-10 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Minimal 8 karakter" /><button type="button" onClick={onToggle} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-green-50 hover:text-forest-800" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>;
}
