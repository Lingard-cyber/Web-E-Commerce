"use client";

import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, LogOut, Package, UserRound } from "lucide-react";
import { type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AccountPanel({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    syncUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
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

    const supabase = createClient();
    const result = mode === "register"
      ? await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { name: name.trim() } } })
      : await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });

    if (result.error) return setMessage(result.error.message);
    if (mode === "register" && !result.data.session) return setMessage("Registrasi berhasil. Silakan cek email untuk mengaktifkan akun.");
    setUser(result.data.user);
    setMessage(mode === "login" ? "Berhasil masuk ke akun." : "Akun berhasil dibuat.");
  };

  const logout = async () => {
    const { error } = await createClient().auth.signOut();
    if (error) return setMessage(error.message);
    setUser(null);
    setMessage("Anda sudah keluar dari akun.");
  };

  if (user) {
    const displayName = String(user.user_metadata?.name || user.email?.split("@")[0] || "Pengguna");
    return (
      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="bg-forest-900 p-7 text-white sm:p-10"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-xl font-bold text-forest-950">{displayName.slice(0, 1).toUpperCase()}</span><div><p className="text-[10px] uppercase tracking-widest text-white/55">Akun pelanggan</p><h2 className="mt-1 font-display text-2xl font-bold">Halo, {displayName}.</h2><p className="mt-1 text-[10px] text-white/60">{user.email}</p></div></div></div>
        <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8"><Link href="/lacak-pesanan" className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4 text-[11px] font-bold text-forest-800 hover:-translate-y-0.5 hover:shadow-md"><Package size={17} />Lacak pesanan</Link><button onClick={logout} className="flex items-center gap-3 rounded-2xl border border-red-100 p-4 text-left text-[11px] font-bold text-red-600 hover:bg-red-50"><LogOut size={17} />Keluar</button></div>
        {message && <p className="mx-6 mb-6 rounded-xl bg-green-50 p-3 text-[10px] leading-5 text-forest-800 sm:mx-8">{message}</p>}
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
          <button className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-forest-800 text-[11px] font-bold text-white hover:-translate-y-0.5 hover:bg-forest-700 hover:shadow-lg"><LockKeyhole size={14} className="mr-2" />{mode === "login" ? "Masuk ke akun" : "Buat akun"}</button>
        </form>
        {message && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-[10px] leading-5 text-amber-900">{message}</p>}
        <p className="mt-6 text-center text-[10px] leading-5 text-muted">Dengan melanjutkan, Anda menyetujui <Link href="/syarat-ketentuan" className="font-bold text-forest-800">syarat &amp; ketentuan</Link>. Autentikasi dikelola oleh Supabase.</p>
      </div>
    </div>
  );
}
