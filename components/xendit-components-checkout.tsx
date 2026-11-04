"use client";

import Link from "next/link";
import { ArrowLeft, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { XenditComponents } from "xendit-components-web";
import { useEffect, useRef, useState } from "react";

export function XenditComponentsCheckout({ sdkKey, publicCode, amount }: { sdkKey: string; publicCode: string; amount: number }) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const actionMountRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<XenditComponents | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!pickerRef.current) return;
    try {
      const sdk = new XenditComponents({ componentsSdkKey: sdkKey });
      sdkRef.current = sdk;
      pickerRef.current.replaceChildren(sdk.createChannelPickerComponent());
      setSdkLoaded(true);
      sdk.addEventListener("action-begin", () => {
        const actionContainer = sdk.createActionContainerComponent();
        actionMountRef.current?.replaceChildren(actionContainer);
        setActionOpen(true);
      });
      sdk.addEventListener("action-end", () => setActionOpen(false));
      sdk.addEventListener("submission-ready", () => setReady(true));
      sdk.addEventListener("submission-not-ready", () => setReady(false));
      sdk.addEventListener("submission-begin", () => { setBusy(true); setMessage("Memproses pembayaran..."); });
      sdk.addEventListener("submission-end", () => setBusy(false));
      sdk.addEventListener("session-complete", () => window.location.assign(`/pesanan/${encodeURIComponent(publicCode)}?payment=success`));
      sdk.addEventListener("session-expired-or-canceled", () => setMessage("Sesi pembayaran berakhir. Silakan kembali ke pesanan dan coba lagi."));
      sdk.addEventListener("fatal-error", (event) => {
        const fatalError = event as Event & { message?: string; userErrorMessage?: string[] };
        if (fatalError.message) console.error("Xendit Components gagal memuat:", fatalError.message);
        const userMessage = fatalError.userErrorMessage?.filter(Boolean).join(" ");
        const diagnostic = process.env.NODE_ENV === "development" && fatalError.message ? ` (${fatalError.message})` : "";
        setMessage(userMessage || `Metode pembayaran belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.${diagnostic}`);
      });
    } catch (error) {
      console.error("Xendit Components gagal diinisialisasi:", error);
      const diagnostic = process.env.NODE_ENV === "development" && error instanceof Error ? ` (${error.message})` : "";
      setMessage(`Metode pembayaran belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.${diagnostic}`);
    }
    return () => {
      pickerRef.current?.replaceChildren();
      sdkRef.current = null;
    };
  }, [publicCode, sdkKey]);

  const submit = () => {
    try {
      sdkRef.current?.submit();
    } catch {
      setMessage("Pilih metode pembayaran dan lengkapi data yang diminta terlebih dahulu.");
    }
  };

  return <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-[900px]">
      <Link href="/checkout" className="inline-flex items-center gap-2 text-xs font-bold text-forest-800 hover:underline"><ArrowLeft size={15} />Kembali ke checkout</Link>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Pembayaran aman</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-forest-950">Pilih metode pembayaran</h1>
          <p className="mt-2 text-xs leading-5 text-muted">Pilih cara pembayaran yang nyaman. Pembayaran diproses dengan aman oleh Xendit.</p>
          <div ref={pickerRef} className="xendit-payment-picker mt-6 min-h-28" />
          {!sdkLoaded && !message && <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted"><LoaderCircle size={16} className="animate-spin text-forest-700" />Memuat metode pembayaran...</div>}
          {message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{message}</p>}
          <button type="button" onClick={submit} disabled={!ready || busy} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-forest-800 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle size={15} className="mr-2 animate-spin" /> : <ShieldCheck size={15} className="mr-2" />}{busy ? "Memproses pembayaran..." : "Bayar sekarang"}</button>
        </section>
        <aside className="h-fit rounded-3xl bg-forest-900 p-6 text-white shadow-xl">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Ringkasan pesanan</p>
          <p className="mt-4 text-xs text-white/75">Kode pesanan</p>
          <p className="mt-1 text-sm font-bold">{publicCode}</p>
          <div className="my-5 border-t border-white/15" />
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-white/75">Total pembayaran</span><strong className="text-lg text-accent">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)}</strong></div>
          <p className="mt-5 text-[10px] leading-5 text-white/65">Jangan tutup halaman ini sampai instruksi pembayaran selesai.</p>
        </aside>
      </div>
    </div>
    <div className={`fixed inset-0 z-[120] items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6 ${actionOpen ? "flex" : "hidden"}`} role="dialog" aria-modal="true" aria-label="Instruksi pembayaran">
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 pt-14 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6 sm:pt-14">
        <button type="button" onClick={() => setActionOpen(false)} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-forest-950 shadow-md transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Tutup instruksi pembayaran"><X size={22} strokeWidth={2.5} /></button>
        <div ref={actionMountRef} />
      </div>
    </div>
    <style jsx global>{`
      :root {
        --xendit-font-family: inherit;
        --xendit-color-primary: #087650;
        --xendit-color-text: #153c30;
        --xendit-color-text-secondary: #687d73;
        --xendit-color-border: #dce8e0;
        --xendit-color-background: #f5f8f4;
        --xendit-radius-1: 12px;
        --xendit-radius-2: 10px;
        --xendit-radius-3: 16px;
      }
    `}</style>
  </main>;
}
