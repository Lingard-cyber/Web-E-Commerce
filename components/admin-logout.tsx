"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { LogoutDialog } from "@/components/logout-dialog";
import { Notification } from "@/components/notification";

export function AdminLogout() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logout = async () => {
    setLoading(true);
    const loginUrl = process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || "/admin/login";
    const response = await fetch("/api/auth/admin-logout", { method: "POST" });
    if (!response.ok) {
      setLoading(false);
      return setError("Sesi admin belum dapat diputus. Silakan coba lagi.");
    }
    window.location.replace(loginUrl);
  };

  return <><button onClick={() => setOpen(true)} disabled={loading} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"><LogOut size={16} />Keluar</button><LogoutDialog open={open} loading={loading} title="Keluar dari panel admin?" description="Sesi admin akan ditutup dan Anda akan diarahkan ke halaman login admin." onCancel={() => setOpen(false)} onConfirm={logout} />{error && <Notification message={error} onClose={() => setError("")} />}</>;
}
