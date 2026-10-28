"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, LogOut, Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { breakAuthSession } from "@/lib/auth-logout";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { AccountCommercePanel } from "@/components/account-commerce-panel";

export function AccountPanel({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillUserData = (currentUser: User | null) => {
    setUser(currentUser);
    setEmail(currentUser?.email || "");
    setName(String(currentUser?.user_metadata?.name || ""));
    setPhone(String(currentUser?.user_metadata?.phone || ""));
    setAddress(String(currentUser?.user_metadata?.address || ""));
  };

  useEffect(() => {
    const supabase = createClient();
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      fillUserData(data.user);
    };

    syncUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => fillUserData(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setMessage("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) return setMessage("Kata sandi minimal 8 karakter.");

    setIsSubmitting(true);
    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) return setMessage(result.error || "Registrasi belum dapat diproses. Silakan coba lagi.");
        setMode("login");
        setPassword("");
        setMessage(result.requiresEmailConfirmation ? "Registrasi berhasil. Cek email Anda untuk konfirmasi sebelum masuk." : "Registrasi berhasil. Silakan masuk dengan email dan kata sandi Anda.");
        return;
      }

      const result = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (result.error) return setMessage(getAuthErrorMessage(result.error.message));

      const syncResponse = await fetch("/api/auth/sync", { method: "POST" });
      if (!syncResponse.ok) return setMessage("Login berhasil, tetapi profil belum tersinkron. Silakan coba lagi.");
      fillUserData(result.data.user);
      router.push("/");
    } catch {
      setMessage("Koneksi ke layanan autentikasi gagal. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, name: name.trim(), phone: phone.trim(), address: address.trim() },
    });

    setSavingProfile(false);
    if (error) return setMessage(error.message);
    await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), phone: phone.trim() }) });
    fillUserData(data.user);
    setMessage("Profil berhasil diperbarui.");
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) return setMessage("Kata sandi baru minimal 8 karakter.");
    if (newPassword !== confirmPassword) return setMessage("Konfirmasi kata sandi belum sama.");

    setChangingPassword(true);
    setMessage("");
    const { error } = await createClient().auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) return setMessage(error.message);
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Kata sandi berhasil diubah.");
  };

  const logout = async () => {
    const error = await breakAuthSession("/");
    if (error) setMessage(error.message);
  };

  if (user) {
    const displayName = String(user.user_metadata?.name || user.email?.split("@")[0] || "Pengguna");
    return (
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="bg-forest-900 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-xl font-bold text-forest-950">{displayName.slice(0, 1).toUpperCase()}</span>
              <div><p className="text-[10px] uppercase tracking-widest text-white/55">Profil pelanggan</p><h2 className="mt-1 font-display text-2xl font-bold">Halo, {displayName}.</h2><p className="mt-1 text-[10px] text-white/60">{user.email}</p></div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="space-y-4">
            <div><p className="flex items-center gap-2 text-sm font-bold text-forest-950"><UserRound size={16} />Data profil</p><p className="mt-1 text-[10px] leading-5 text-muted">Perbarui informasi yang digunakan saat berbelanja.</p></div>
            <label className="block text-[10px] font-bold text-ink">Nama lengkap<input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-normal outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder="Nama Anda" /></label>
            <label className="block text-[10px] font-bold text-ink">Email<div className="relative mt-1"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={email} readOnly type="email" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-9 text-xs font-normal text-muted outline-none" /></div></label>
            <label className="block text-[10px] font-bold text-ink">Nomor WhatsApp / telepon<div className="relative mt-1"><Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" className="h-11 w-full rounded-xl border border-slate-200 px-3 pl-9 text-xs font-normal outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder="081234567890" /></div></label>
            <label className="block text-[10px] font-bold text-ink">Alamat utama<div className="relative mt-1"><MapPin size={15} className="absolute left-3 top-3 text-muted" /><textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 pl-9 text-xs font-normal outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder="Alamat pengiriman utama" /></div></label>
            <button type="submit" disabled={savingProfile} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest-800 text-[11px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-forest-700 disabled:cursor-wait disabled:opacity-60"><Save size={14} />{savingProfile ? "Menyimpan..." : "Simpan perubahan"}</button>
          </form>

          <form onSubmit={changePassword} className="space-y-4 rounded-2xl bg-slate-50 p-5 sm:p-6">
            <div><p className="flex items-center gap-2 text-sm font-bold text-forest-950"><KeyRound size={16} />Keamanan akun</p><p className="mt-1 text-[10px] leading-5 text-muted">Gunakan kata sandi baru minimal 8 karakter.</p></div>
            <PasswordField label="Kata sandi baru" value={newPassword} onChange={setNewPassword} show={showNewPassword} onToggle={() => setShowNewPassword((value) => !value)} requiredText="Minimal 8 karakter" autoComplete="new-password" />
            <PasswordField label="Konfirmasi kata sandi baru" value={confirmPassword} onChange={setConfirmPassword} show={showNewPassword} onToggle={() => setShowNewPassword((value) => !value)} requiredText="Ulangi kata sandi baru" autoComplete="new-password" />
            <button type="submit" disabled={changingPassword} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest-800 text-[11px] font-bold text-forest-800 transition hover:bg-white disabled:cursor-wait disabled:opacity-60"><LockKeyhole size={14} />{changingPassword ? "Mengubah..." : "Ubah kata sandi"}</button>
          </form>
        </div>

        <div className="border-t border-slate-100 px-6 pb-6 sm:px-8 sm:pb-8">
          <AccountCommercePanel />
        </div>

        {message && <p className="mx-6 mb-5 rounded-xl bg-green-50 p-3 text-[10px] leading-5 text-forest-800 sm:mx-8">{message}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-5 sm:px-8"><Link href="/produk" className="text-[10px] font-bold text-forest-800 hover:underline">Kembali belanja</Link><button onClick={logout} className="flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-[10px] font-bold text-red-600 hover:bg-red-50"><LogOut size={15} />Keluar</button></div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card md:grid-cols-[.85fr_1.15fr]">
      <div className="relative overflow-hidden bg-forest-900 p-7 text-white sm:p-10"><div className="hero-pattern absolute inset-0 opacity-20" /><div className="relative"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-forest-950"><UserRound size={21} /></span><h2 className="mt-8 font-display text-3xl font-bold leading-tight">Satu akun untuk perjalanan belanja yang lebih nyaman.</h2><p className="mt-4 text-xs leading-6 text-white/65">Simpan keranjang, ikuti status pesanan, dan lanjutkan checkout ketika produk sudah siap ditransaksikan.</p><div className="mt-8 space-y-3 text-[10px] text-white/75"><p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /> Riwayat pesanan lebih rapi</p><p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /> Checkout lebih terarah</p><p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /> Terhubung dengan bantuan admin</p></div></div></div>
      <div className="p-7 sm:p-10">
        <div className="mb-7 flex gap-2 rounded-xl bg-slate-50 p-1"><button onClick={() => switchMode("login")} className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold ${mode === "login" ? "bg-white text-forest-800 shadow-sm" : "text-muted"}`}>Masuk</button><button onClick={() => switchMode("register")} className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold ${mode === "register" ? "bg-white text-forest-800 shadow-sm" : "text-muted"}`}>Daftar</button></div>
        <h3 className="font-display text-2xl font-bold">{mode === "login" ? "Selamat datang kembali." : "Buat akun baru."}</h3><p className="mt-2 text-xs leading-5 text-muted">{mode === "login" ? "Masuk untuk mengelola keranjang dan pesanan." : "Daftar untuk menyimpan perjalanan belanja Anda."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <label className="block text-[10px] font-bold text-ink">Nama lengkap<input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder="Nama Anda" /></label>}
          <label className="block text-[10px] font-bold text-ink">Email<input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder="nama@email.com" /></label>
          <label className="block text-[10px] font-bold text-ink">Kata sandi<div className="relative mt-1"><input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} className="h-11 w-full rounded-xl border border-slate-200 px-3 pr-11 text-xs outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder="Minimal 8 karakter" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-green-50 hover:text-forest-800" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></label>
          <button type="submit" disabled={isSubmitting} className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-forest-800 text-[11px] font-bold text-white hover:-translate-y-0.5 hover:bg-forest-700 hover:shadow-lg disabled:cursor-wait disabled:opacity-60"><LockKeyhole size={14} className="mr-2" />{isSubmitting ? "Memproses..." : mode === "login" ? "Masuk ke akun" : "Buat akun"}</button>
        </form>
        {message && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-[10px] leading-5 text-amber-900">{message}</p>}
        <p className="mt-6 text-center text-[10px] leading-5 text-muted">Dengan melanjutkan, Anda menyetujui <Link href="/syarat-ketentuan" className="font-bold text-forest-800">syarat &amp; ketentuan</Link>. Kami menjaga data akun Anda agar tetap aman.</p>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, requiredText, autoComplete }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void; requiredText: string; autoComplete: string }) {
  return (
    <label className="block text-[10px] font-bold text-ink">
      {label}
      <div className="relative mt-1"><input value={value} onChange={(event) => onChange(event.target.value)} required minLength={8} autoComplete={autoComplete} type={show ? "text" : "password"} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-xs font-normal outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder={requiredText} /><button type="button" onClick={onToggle} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-green-50 hover:text-forest-800" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{show ? <EyeOff size={14} /> : <Eye size={14} />}</button></div>
    </label>
  );
}
