"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) return setMessage("Kata sandi minimal 8 karakter.");
    if (isRegister && password !== confirmation) return setMessage("Konfirmasi kata sandi belum sama.");

    const supabase = createClient();
    const result = isRegister
      ? await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { name: name.trim(), phone: phone.trim(), address: address.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
      : await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });

    if (result.error) return setMessage(result.error.message);
    if (isRegister && !result.data.session) return setMessage("Registrasi berhasil. Silakan cek email untuk mengaktifkan akun.");
    router.push("/akun");
  };

  return (
    <div className="w-full max-w-[540px] rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(24,66,45,.08)] sm:p-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800">
          • {isRegister ? "Registrasi Customer" : "Area Customer"}
        </span>
        <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold leading-tight text-forest-900">
          {isRegister ? "Daftar Akun Baru" : "Masuk ke Akun"}
        </h1>
        <p className="mx-auto mt-2 max-w-[430px] text-xs leading-5 text-muted">
          {isRegister
            ? "Bergabunglah dengan Kepuharjo Market untuk menemukan produk lokal dan layanan warga."
            : "Silakan masukkan email dan kata sandi Anda untuk mengakses profil dan memantau riwayat pesanan."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-7 space-y-4">
        {isRegister && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-[11px] font-bold text-ink">
              Nama Lengkap <span className="text-red-600">*</span>
              <div className="relative mt-1.5">
                <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Contoh: Nama lengkap" />
              </div>
            </label>
            <label className="block text-[11px] font-bold text-ink">
              Alamat Email <span className="text-red-600">*</span>
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
          <>
            <label className="block text-[11px] font-bold text-ink">
              Nomor WhatsApp / Telepon <span className="font-normal text-muted">(Opsional)</span>
              <div className="relative mt-1.5">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Contoh: 081234567890" />
              </div>
            </label>
            <label className="block text-[11px] font-bold text-ink">
              Alamat Pengiriman Utama <span className="font-normal text-muted">(Opsional)</span>
              <div className="relative mt-1.5">
                <MapPin size={15} className="absolute left-3 top-3 text-muted" />
                <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} autoComplete="street-address" className="w-full resize-y rounded-lg border border-slate-200 bg-[#f5f8f4] py-2.5 pl-9 pr-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Nama jalan, no. rumah, RT/RW, kalurahan, kecamatan, kabupaten, kode pos" />
              </div>
            </label>
          </>
        )}

        {isRegister ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField label="Kata Sandi" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} requiredText="Min. 8 karakter" />
            <PasswordField label="Konfirmasi Kata Sandi" value={confirmation} onChange={setConfirmation} show={showPassword} onToggle={() => setShowPassword((value) => !value)} requiredText="Ulangi kata sandi" />
          </div>
        ) : (
          <PasswordField label="Kata Sandi" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} requiredText="Masukkan kata sandi Anda" />
        )}

        <button className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white shadow-[0_8px_16px_rgba(3,61,45,.18)] transition hover:-translate-y-0.5 hover:bg-forest-700 hover:shadow-lg">
          {isRegister ? "Daftar Akun Sekarang" : "Masuk ke Akun"} <span className="ml-1">→</span>
        </button>
      </form>

      {message && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-[10px] leading-5 text-amber-900">{message}</p>}
      <div className="my-5 border-t border-slate-200" />
      <p className="text-center text-[11px] text-muted">
        {isRegister ? "Sudah memiliki akun?" : "Belum memiliki akun?"}{" "}
        {isRegister ? <Link href="/akun/login" className="font-bold text-forest-800 underline underline-offset-2">Masuk di sini</Link> : <Link href="/akun/daftar" className="font-bold text-forest-800 underline underline-offset-2">Daftar sekarang</Link>}
      </p>
      <p className="mt-4 text-center text-[9px] leading-4 text-muted">Akun dan sesi dikelola dengan aman oleh Supabase.</p>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, requiredText }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void; requiredText: string }) {
  return (
    <label className="block text-[11px] font-bold text-ink">
      {label} <span className="text-red-600">*</span>
      <div className="relative mt-1.5">
        <LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={value} onChange={(event) => onChange(event.target.value)} required minLength={8} autoComplete={label === "Kata Sandi" ? "current-password" : "new-password"} type={show ? "text" : "password"} className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] px-9 pr-10 text-xs font-normal outline-none transition focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder={requiredText} />
        <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-green-50 hover:text-forest-800" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </label>
  );
}
