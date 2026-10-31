"use client";

import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Konfirmasi",
  loading = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
    <div className="animate-modal-in relative w-full max-w-[430px] rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-2xl sm:p-7">
      <button type="button" onClick={onCancel} disabled={loading} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-ink disabled:opacity-50" aria-label="Tutup konfirmasi"><X size={19} /></button>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700"><AlertTriangle size={20} /></span>
      <h2 id="confirm-dialog-title" className="mt-5 font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} disabled={loading} className="h-11 rounded-xl border border-slate-200 text-[11px] font-bold text-ink transition hover:bg-slate-50 disabled:opacity-50">Batal</button>
        <button type="button" onClick={onConfirm} disabled={loading} className="h-11 rounded-xl bg-forest-800 text-[11px] font-bold text-white transition hover:bg-forest-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Memproses..." : confirmLabel}</button>
      </div>
    </div>
  </div>, document.body);
}

