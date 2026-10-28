"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    setNextPath(next && next.startsWith("/") && !next.startsWith("//") ? next : "");
    if (isRegister) return;
    if (params.get("callback_error") === "1") {
      setMessage("Link konfirmasi email tidak valid atau sudah kedaluwarsa. Silakan daftar ulang jika diperlukan.");
    } else if (params.get("registered") === "1") setMessage("Registrasi berhasil. Silakan masuk menggunakan email dan kata sandi Anda.");
  }, [isRegister]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) return setMessage("Kata sandi minimal 8 karakter.");
    if (isRegister && password !== confirmation) return setMessage("Konfirmasi kata sandi belum sama.");

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (isRegister) {
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password }) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) return setMessage(result.error || "Registrasi belum dapat diproses. Silakan coba lagi.");
        router.push(`/akun/login?registered=1${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`);
        return;
      }

      const result = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (result.error) return setMessage(getAuthErrorMessage(result.error.message));

      const syncResponse = await fetch("/api/auth/sync", { method: "POST" });
      if (!syncResponse.ok) return setMessage("Login berhasil, tetapi profil belum tersinkron. Silakan coba lagi.");
      router.push(nextPath || "/");
    } catch {
      setMessage("Koneksi ke layanan autentikasi gagal. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isRegister ? "w-full max-w-[440px] rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(24,66,45,.08)] sm:p-7" : "animate-modal-in relative w-full rounded-2xl bg-white p-6 text-ink shadow-2xl sm:p-7"}>
      {!isRegister && <Link href="/" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-slate-100 hover:text-ink" aria-label="Tutup login"><X size={19} /></Link>}
      <div className={isRegister ? "text-center" : "text-left"}>
        <span className={isRegister ? "inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800" : "pr-8 text-[10px] font-bold uppercase tracking-[.16em] text-forest-700"}>
          {isRegister ? "Registrasi Customer" : "Akun Kepuharjo Market"}
        </span>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold leading-tight text-forest-900">
          {isRegister ? "Daftar Akun Baru" : "Masuk"}
        </h1>
        {!isRegister && (
          <p className="mt-2 text-left text-xs leading-5 text-muted">
            Masuk untuk menyimpan keranjang dan melihat pesanan Anda.
          </p>
        )}
      </div>

      {isRegister && (
        <div className="mt-5 rounded-xl border border-green-100 bg-[#f5f8f4] px-3.5 py-3 text-[10px] leading-5 text-muted">
          <p className="font-bold text-forest-900">Data yang perlu disiapkan</p>
          <p><span className="font-semibold text-ink">Wajib:</span> nama lengkap, email aktif, nomor WhatsApp, dan kata sandi.</p>
          <p>Alamat pengiriman dapat ditambahkan nanti saat checkout.</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-7 space-y-4">
        {isRegister && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-[11px] font-bold text-ink">
              Nama lengkap <span className="text-red-600">*</span>
              <div className="relative mt-1.5">
                <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Contoh: Siti Aminah" />
              </div>
            </label>
            <label className="block text-[11px] font-bold text-ink">
              Email aktif <span className="text-red-600">*</span>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="nama@email.com" />
              </div>
            </label>
          </div>
        )}

        {!isRegister && (
          <label className="block text-[11px] font-bold text-ink">
            Alamat Email <span className="text-red-600">*</span>
            <div className="relative mt-1.5">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" className="h-11 w-full rounded-lg border border-forest-700 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none ring-4 ring-green-50 transition focus:bg-white" placeholder="nama@email.com" />
            </div>
          </label>
        )}

        {isRegister && (
          <label className="block text-[11px] font-bold text-ink">
            Nomor WhatsApp / telepon <span className="text-red-600">*</span>
            <div className="relative mt-1.5">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={phone} onChange={(event) => setPhone(event.target.value)} required type="tel" autoComplete="tel" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Contoh: 081234567890" />
            </div>
          </label>
        )}

        {isRegister ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField label="Kata sandi" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} requiredText="Minimal 8 karakter" autoComplete="new-password" />
            <PasswordField label="Ulangi kata sandi" value={confirmation} onChange={setConfirmation} show={showPassword} onToggle={() => setShowPassword((value) => !value)} requiredText="Ketik ulang kata sandi" autoComplete="new-password" />
          </div>
        ) : (
          <PasswordField label="Kata sandi" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} requiredText="Masukkan kata sandi Anda" autoComplete="current-password" />
        )}

        <button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white shadow-[0_8px_16px_rgba(3,61,45,.18)] transition hover:-translate-y-0.5 hover:bg-forest-700 hover:shadow-lg disabled:cursor-wait disabled:opacity-60">
          {isSubmitting ? "Memproses..." : isRegister ? "Daftar Akun Sekarang" : "Masuk ke Akun"} <span className="ml-1">→</span>
        </button>
      </form>

      {message && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-[10px] leading-5 text-amber-900">{message}</p>}
      {!isRegister && <div className="mt-4 text-center"><Link href="/akun/lupa-password" className="text-[10px] font-bold text-forest-800 underline underline-offset-2">Lupa kata sandi?</Link></div>}
      <div className="my-5 border-t border-slate-200" />
      <p className="text-center text-[11px] text-muted">
        {isRegister ? "Sudah memiliki akun?" : "Belum memiliki akun?"}{" "}
        {isRegister ? <Link href={`/akun/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="font-bold text-forest-800 underline underline-offset-2">Masuk di sini</Link> : <Link href={`/akun/daftar${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="font-bold text-forest-800 underline underline-offset-2">Daftar sekarang</Link>}
      </p>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, requiredText, autoComplete }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void; requiredText: string; autoComplete: "current-password" | "new-password" }) {
  return (
    <label className="block text-[11px] font-bold text-ink">
      {label} <span className="text-red-600">*</span>
      <div className="relative mt-1.5">
        <LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={value} onChange={(event) => onChange(event.target.value)} required minLength={8} autoComplete={autoComplete} type={show ? "text" : "password"} className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] px-9 pr-10 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder={requiredText} />
        <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-green-50 hover:text-forest-800" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </label>
  );
}
