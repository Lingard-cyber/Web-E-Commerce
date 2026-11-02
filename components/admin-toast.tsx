"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CircleCheck, LoaderCircle, X } from "lucide-react";

export function AdminToast({ message, onClose }: { message: string; onClose: () => void }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const pending = /^(menyimpan|memproses|memeriksa|menghapus|memindahkan)/i.test(message);
  const success = !/gagal|belum|tidak dapat|tidak bisa|error/i.test(message) && /berhasil|tersimpan|disimpan|diperbarui|diarsipkan|dipindahkan|diubah/i.test(message);

  useEffect(() => {
    if (!message || pending) return;
    const timeout = window.setTimeout(() => onCloseRef.current(), 6000);
    return () => window.clearTimeout(timeout);
  }, [message, pending]);

  if (!message || typeof document === "undefined") return null;
  const Icon = pending ? LoaderCircle : success ? CircleCheck : AlertTriangle;
  const tone = pending ? "border-blue-200 text-blue-900" : success ? "border-green-200 text-green-900" : "border-amber-200 text-amber-950";
  const iconTone = pending ? "text-blue-600" : success ? "text-green-700" : "text-amber-700";

  return createPortal(<div className={`fixed right-4 top-4 z-[140] flex w-[min(420px,calc(100vw-2rem))] items-start gap-3 rounded-2xl border bg-white p-4 text-sm shadow-2xl ${tone}`} role={pending || success ? "status" : "alert"} aria-live={pending || success ? "polite" : "assertive"}>
    <Icon size={19} className={`mt-0.5 shrink-0 ${iconTone} ${pending ? "animate-spin" : ""}`} />
    <p className="flex-1 leading-5">{message}</p>
    {!pending && <button type="button" onClick={onClose} className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="Tutup notifikasi"><X size={15} /></button>}
  </div>, document.body);
}
