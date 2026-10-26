"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

type ContactMode = "email" | "phone";
type RegisterStep = "contact" | "otp" | "profile";

function normalizePhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  if (compact.startsWith("08")) return `+62${compact.slice(1)}`;
  return compact;
}

export function RegisterFlow() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("contact");
  const [mode, setMode] = useState<ContactMode>("email");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendOtp = async () => {
    const value = mode === "email" ? contact.trim().toLowerCase() : normalizePhone(contact);
    if (mode === "email" && !/^\S+@\S+\.\S+$/.test(value)) return setMessage("Masukkan alamat email yang valid.");
    if (mode === "phone" && !/^\+?[1-9]\d{8,14}$/.test(value)) return setMessage("Masukkan nomor WhatsApp/telepon yang valid.");
    setMessage("");
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const result = mode === "email"
        ? await supabase.auth.signInWithOtp({ email: value, options: { shouldCreateUser: true } })
        : await supabase.auth.signInWithOtp({ phone: value, options: { shouldCreateUser: true } });
      if (result.error) return setMessage(getAuthErrorMessage(result.error.message));
      setContact(value);
      setEmail(mode === "email" ? value : "");
      setPhone(mode === "phone" ? value : "");
      setStep("otp");
    } catch {
      setMessage("Kode OTP belum dapat dikirim. Periksa koneksi atau konfigurasi layanan OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) return setMessage("Masukkan kode OTP 6 digit.");
    setMessage("");
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const result = mode === "email"
        ? await supabase.auth.verifyOtp({ email: contact, token: otp.trim(), type: "email" })
        : await supabase.auth.verifyOtp({ phone: contact, token: otp.trim(), type: "sms" });
      if (result.error) return setMessage(getAuthErrorMessage(result.error.message));
      setStep("profile");
    } catch {
      setMessage("Kode OTP belum dapat diverifikasi. Silakan periksa kembali kode yang diterima.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) return setMessage("Kata sandi minimal 8 karakter.");
    if (password !== confirmation) return setMessage("Konfirmasi kata sandi belum sama.");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return setMessage("Email aktif wajib diisi untuk menyelesaikan profil.");
    setMessage("");
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const result = await supabase.auth.updateUser({ password, data: { name: name.trim(), phone: phone.trim(), contactEmail: email.trim().toLowerCase() } });
      if (result.error) return setMessage(getAuthErrorMessage(result.error.message));
      const syncResponse = await fetch("/api/auth/sync", { method: "POST" });
      if (!syncResponse.ok) return setMessage("Profil tersimpan, tetapi sinkronisasi akun belum selesai. Silakan muat ulang halaman.");
      router.push("/akun");
      router.refresh();
    } catch {
      setMessage("Profil belum dapat disimpan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepNumber = step === "contact" ? 1 : step === "otp" ? 2 : 3;
  const stepTitle = step === "contact" ? "Mulai dengan kontak Anda" : step === "otp" ? "Verifikasi kode OTP" : "Lengkapi data pribadi";

  return <div className="w-full max-w-[440px] rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(24,66,45,.08)] sm:p-7">
    <div className="text-center"><span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-forest-800"><ShieldCheck size={12} /> Registrasi Customer · Langkah {stepNumber}/3</span><h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold leading-tight text-forest-900">Daftar Akun Baru</h1><p className="mx-auto mt-2 max-w-[340px] text-xs leading-5 text-muted">{stepTitle}</p></div>
    <div className="mt-6 grid grid-cols-3 gap-2">{["Kontak", "OTP", "Data pribadi"].map((label, index) => <div key={label}><div className={`h-1.5 rounded-full ${index < stepNumber ? "bg-forest-700" : "bg-slate-100"}`} /><p className={`mt-1.5 text-center text-[9px] ${index + 1 === stepNumber ? "font-bold text-forest-800" : "text-muted"}`}>{label}</p></div>)}</div>

    {step === "contact" && <div className="mt-6 space-y-4"><div className="grid grid-cols-2 rounded-xl bg-[#f5f8f4] p-1"><button type="button" onClick={() => { setMode("email"); setContact(""); }} className={`rounded-lg py-2.5 text-[10px] font-bold ${mode === "email" ? "bg-white text-forest-800 shadow-sm" : "text-muted"}`}><Mail size={13} className="mr-1.5 inline" />Email</button><button type="button" onClick={() => { setMode("phone"); setContact(""); }} className={`rounded-lg py-2.5 text-[10px] font-bold ${mode === "phone" ? "bg-white text-forest-800 shadow-sm" : "text-muted"}`}><Phone size={13} className="mr-1.5 inline" />Nomor telepon</button></div><label className="block text-[11px] font-bold text-ink">{mode === "email" ? "Email aktif" : "Nomor WhatsApp / telepon"}<div className="relative mt-1.5">{mode === "email" ? <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /> : <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />}<input autoFocus required value={contact} onChange={(event) => setContact(event.target.value)} type={mode === "email" ? "email" : "tel"} autoComplete={mode === "email" ? "email" : "tel"} className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder={mode === "email" ? "nama@email.com" : "081234567890"} /></div></label><p className="rounded-xl border border-green-100 bg-[#f5f8f4] p-3 text-[10px] leading-5 text-muted">Kami akan mengirim kode OTP ke {mode === "email" ? "email" : "nomor telepon"} ini untuk memverifikasi akun.</p><button type="button" onClick={sendOtp} disabled={isSubmitting || !contact.trim()} className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white shadow-[0_8px_16px_rgba(3,61,45,.18)] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Mengirim kode..." : "Kirim kode OTP"} <ArrowRight size={14} className="ml-2" /></button></div>}

    {step === "otp" && <div className="mt-6 space-y-4"><div className="rounded-xl border border-green-100 bg-[#f5f8f4] p-4 text-center"><p className="text-[10px] text-muted">Kode OTP dikirim ke</p><strong className="mt-1 block text-sm text-forest-900">{contact}</strong></div><label className="block text-[11px] font-bold text-ink">Kode OTP<div className="relative mt-1.5"><input autoFocus required inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="h-14 w-full rounded-lg border border-forest-700 bg-[#f5f8f4] text-center text-xl font-bold tracking-[.45em] text-forest-900 outline-none focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="••••••" /></div><span className="mt-1.5 block text-center text-[9px] font-normal text-muted">Masukkan 6 digit kode yang kamu terima.</span></label><button type="button" onClick={verifyOtp} disabled={isSubmitting || otp.length !== 6} className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Memverifikasi..." : "Verifikasi OTP"} <ArrowRight size={14} className="ml-2" /></button><div className="flex items-center justify-between text-[10px]"><button type="button" onClick={() => { setStep("contact"); setOtp(""); setMessage(""); }} className="inline-flex items-center gap-1 font-bold text-muted hover:text-forest-800"><ArrowLeft size={13} />Ganti kontak</button><button type="button" onClick={sendOtp} disabled={isSubmitting} className="font-bold text-forest-800 hover:underline disabled:opacity-50">Kirim ulang OTP</button></div></div>}

    {step === "profile" && <form onSubmit={completeProfile} className="mt-6 space-y-4"><div className="rounded-xl border border-green-100 bg-[#f5f8f4] p-3 text-[10px] leading-5 text-muted"><p className="font-bold text-forest-900">Akun sudah terverifikasi.</p><p>Lengkapi data berikut agar checkout dan pengiriman dapat diproses.</p></div><label className="block text-[11px] font-bold text-ink">Nama lengkap<div className="relative mt-1.5"><UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="Contoh: Siti Aminah" /></div></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-[11px] font-bold text-ink">Email aktif<div className="relative mt-1.5"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required disabled={mode === "email"} value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none disabled:cursor-not-allowed disabled:opacity-70 focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="nama@email.com" /></div></label><label className="block text-[11px] font-bold text-ink">Nomor WhatsApp / telepon<div className="relative mt-1.5"><Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required={mode === "phone"} value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] pl-9 pr-3 text-xs font-normal outline-none focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder="081234567890" /></div></label></div><div className="grid gap-4 sm:grid-cols-2"><PasswordField label="Kata sandi" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} placeholder="Minimal 8 karakter" /><PasswordField label="Ulangi kata sandi" value={confirmation} onChange={setConfirmation} show={showPassword} onToggle={() => setShowPassword((value) => !value)} placeholder="Ketik ulang kata sandi" /></div><button disabled={isSubmitting} className="flex h-11 w-full items-center justify-center rounded-lg bg-forest-800 text-[11px] font-bold text-white shadow-[0_8px_16px_rgba(3,61,45,.18)] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Menyimpan..." : "Selesai dan masuk"} <CheckCircle2 size={14} className="ml-2" /></button></form>}

    {message && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-[10px] leading-5 text-amber-900">{message}</p>}<div className="my-5 border-t border-slate-200" /><p className="text-center text-[11px] text-muted">Sudah memiliki akun? <Link href="/akun/login" className="font-bold text-forest-800 underline underline-offset-2">Masuk di sini</Link></p>
  </div>;
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void; placeholder: string }) {
  return <label className="block text-[11px] font-bold text-ink">{label}<div className="relative mt-1.5"><LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={value} onChange={(event) => onChange(event.target.value)} required minLength={8} autoComplete="new-password" type={show ? "text" : "password"} className="h-11 w-full rounded-lg border border-slate-200 bg-[#f5f8f4] px-9 pr-10 text-xs font-normal outline-none focus:border-forest-700 focus:bg-white focus:ring-4 focus:ring-green-50" placeholder={placeholder} /><button type="button" onClick={onToggle} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-green-50 hover:text-forest-800" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>;
}
