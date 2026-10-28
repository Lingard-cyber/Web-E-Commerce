"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";

export function Notification({ message, tone = "error", onClose }: { message: string; tone?: "success" | "error" | "info"; onClose?: () => void }) {
  const success = tone === "success";
  return <div className="animate-toast-in fixed bottom-5 left-1/2 z-[120] flex w-[min(430px,calc(100vw-2rem))] -translate-x-1/2 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl" role={tone === "error" ? "alert" : "status"}>
    <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${success ? "bg-green-50 text-forest-800" : "bg-amber-50 text-amber-700"}`}>{success ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}</span>
    <p className="flex-1 text-xs leading-5 text-ink">{message}</p>
    {onClose && <button type="button" onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted hover:bg-slate-100" aria-label="Tutup notifikasi"><X size={15} /></button>}
  </div>;
}

