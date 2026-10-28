"use client";

import { LogOut, X } from "lucide-react";

export function LogoutDialog({
  open,
  loading = false,
  title = "Keluar dari akun?",
  description = "Anda akan keluar dari sesi saat ini. Anda dapat masuk kembali kapan saja.",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-7 text-ink shadow-2xl sm:p-8">
        <button type="button" onClick={onCancel} disabled={loading} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-ink disabled:opacity-50" aria-label="Tutup dialog keluar"><X size={21} /></button>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600"><LogOut size={21} /></span>
        <h2 id="logout-dialog-title" className="mt-6 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="h-11 rounded-xl border border-slate-200 text-[11px] font-bold text-ink transition hover:bg-slate-50 disabled:opacity-50">Batal</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="h-11 rounded-xl bg-red-600 text-[11px] font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Memproses..." : "Keluar"}</button>
        </div>
      </div>
    </div>
  );
}
