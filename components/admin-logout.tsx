"use client";

import { LogOut } from "lucide-react";

export function AdminLogout() {
  const logout = async () => {
    const loginUrl = process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || "/login";
    const response = await fetch("/api/auth/admin-logout", { method: "POST" });
    if (!response.ok) return window.alert("Sesi admin belum dapat diputus. Silakan coba lagi.");
    window.location.replace(loginUrl);
  };

  return <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"><LogOut size={16} />Keluar</button>;
}
