"use client";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return setMessage(result.error || "Login admin belum berhasil.");

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Koneksi ke layanan autentikasi gagal. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-left text-[10px] font-bold text-forest-950">Email admin<div className="relative mt-1.5"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border border-forest-700 bg-white pl-9 pr-3 text-xs font-normal outline-none focus:ring-4 focus:ring-green-100" placeholder="nama@email.com" /></div></label><label className="block text-left text-[10px] font-bold text-forest-950">Kata sandi pengelola<div className="relative mt-1.5"><LockKeyhole size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input required minLength={8} autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-forest-700 bg-white pl-9 pr-10 text-xs font-normal outline-none focus:ring-4 focus:ring-green-100" placeholder="Minimal 8 karakter" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-green-50 hover:text-forest-800" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div><span className="mt-1.5 block text-[9px] font-normal leading-4 text-muted">Gunakan kata sandi akun Supabase admin.</span></label><button disabled={loading || !email || password.length < 8} className="h-11 w-full rounded-lg bg-forest-800 text-[10px] font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Memeriksa..." : "Masuk ke Admin"}</button>{message && <p className="rounded-lg bg-amber-50 p-3 text-center text-[10px] leading-5 text-amber-900">{message}</p>}</form>;
}
