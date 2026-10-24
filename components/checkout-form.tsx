"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartItem, persistCartToDatabase, readCart, writeCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/catalog";

export function CheckoutForm() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ recipientName: "", phone: "", address: "", village: "", district: "", regency: "Sleman", postalCode: "" });
  const [state, setState] = useState({ loading: false, error: "" });
  useEffect(() => setItems(readCart()), []);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) return setState({ loading: false, error: "Keranjang masih kosong." });
    setState({ loading: true, error: "" });
    const canonicalItems = await persistCartToDatabase(items);
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), items: canonicalItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity })), address: form }) });
    const result = await response.json().catch(() => ({})) as { error?: string; checkoutUrl?: string; publicCode?: string };
    if (!response.ok) return setState({ loading: false, error: result.error || "Checkout belum dapat diproses." });
    writeCart([]);
    await persistCartToDatabase([]);
    if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
    else if (result.publicCode) window.location.assign(`/pesanan/${result.publicCode}`);
  };

  if (!items.length) return <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white p-10 text-center shadow-card"><h1 className="font-display text-3xl font-bold">Keranjang masih kosong.</h1><p className="mt-3 text-sm text-muted">Tambahkan produk terlebih dahulu sebelum melanjutkan checkout.</p><Link href="/belanja" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-forest-800 px-5 text-[10px] font-bold text-white">Kembali belanja <ArrowRight size={14} className="ml-2" /></Link></div>;

  return <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]"><div className="space-y-5"><section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-forest-800"><MapPin size={18} /></span><div><h1 className="font-display text-2xl font-bold">Alamat pengiriman</h1><p className="mt-1 text-xs text-muted">Data ini disimpan sebagai snapshot pada pesanan.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Field label="Nama penerima" value={form.recipientName} onChange={(value) => setForm({ ...form, recipientName: value })} required /><Field label="Nomor WhatsApp" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required /><label className="block text-[10px] font-bold sm:col-span-2">Alamat lengkap<textarea required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} rows={4} className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-normal outline-none focus:border-forest-700 focus:ring-4 focus:ring-green-50" placeholder="Nama jalan, dusun, nomor rumah, patokan" /></label><Field label="Kalurahan / desa" value={form.village} onChange={(value) => setForm({ ...form, village: value })} /><Field label="Kapanewon" value={form.district} onChange={(value) => setForm({ ...form, district: value })} /><Field label="Kabupaten" value={form.regency} onChange={(value) => setForm({ ...form, regency: value })} /><Field label="Kode pos" value={form.postalCode} onChange={(value) => setForm({ ...form, postalCode: value })} /></div></section><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-950"><strong>Catatan pembayaran</strong><br />Harga dan stok divalidasi ulang di server. Setelah pesanan dibuat, Anda diarahkan ke halaman pembayaran Xendit.</div>{state.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-xs text-red-700">{state.error}{state.error.includes("masuk") && <><br /><Link href="/akun/login?next=/checkout" className="mt-2 inline-block font-bold underline">Masuk ke akun</Link></>}</p>}</div><aside className="h-fit rounded-3xl bg-forest-900 text-white shadow-xl lg:sticky lg:top-24"><div className="p-6 sm:p-7"><p className="text-[10px] uppercase tracking-widest text-white/55">Ringkasan</p><div className="mt-5 space-y-3">{items.map((item) => <div key={`${item.productSlug}-${item.variantId}`} className="flex justify-between gap-3 text-xs"><span className="min-w-0"><span className="block truncate">{item.productName}</span><small className="text-white/55">{item.variantLabel} × {item.quantity}</small></span><strong className="shrink-0">{formatRupiah(item.unitPrice * item.quantity)}</strong></div>)}</div><div className="my-5 border-t border-white/10" /><div className="flex justify-between text-lg"><span className="font-display font-bold">Total</span><strong className="text-accent">{formatRupiah(total)}</strong></div><button disabled={state.loading} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent text-[11px] font-bold text-forest-950 disabled:cursor-wait disabled:opacity-60">{state.loading ? <LoaderCircle size={15} className="mr-2 animate-spin" /> : <LockKeyhole size={15} className="mr-2" />}{state.loading ? "Menyiapkan pembayaran..." : "Lanjut ke pembayaran"}</button></div><div className="grid gap-3 border-t border-white/10 bg-white/5 p-5 text-[10px] text-white/70"><p className="flex items-center gap-2"><ShieldCheck size={14} className="text-accent" /> Validasi harga dan stok di server.</p><p className="flex items-center gap-2"><LockKeyhole size={14} className="text-accent" /> Status dibuktikan melalui webhook.</p></div></aside></form>;
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-[10px] font-bold">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-normal outline-none focus:border-forest-700 focus:ring-4 focus:ring-green-50" /></label>; }
