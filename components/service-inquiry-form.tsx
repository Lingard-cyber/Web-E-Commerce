"use client";

import { CheckCircle2, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { orderingContacts, orderingWhatsappUrl } from "@/lib/ordering-contacts";

const serviceStartingPrices: Record<string, number> = {
  "rumah-jahit-masruroh": 50000,
  "yuni-taylor": 35000,
  "tas-rajut": 75000,
  "keladi-hias-plastik": 50000,
};

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export function ServiceInquiryForm({ productSlug }: { productSlug: string }) {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [state, setState] = useState({ loading: false, message: "", success: false });
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ loading: true, message: "", success: false });
    const response = await fetch("/api/service-inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productSlug, ...form }) });
    const result = await response.json().catch(() => ({}));
    setState({ loading: false, message: result.message || result.error || "Permintaan belum dapat dikirim.", success: response.ok });
    if (response.ok) setForm({ name: "", contact: "", message: "" });
  };
  const startingPrice = serviceStartingPrices[productSlug];
  return <div id="permintaan" className="mt-7 rounded-2xl border border-forest-700/15 bg-[#f5f8f4] p-5 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Form kebutuhan layanan</p><h2 className="mt-2 font-display text-2xl font-bold">Minta konsultasi atau penawaran</h2>{startingPrice && <div className="mt-4 rounded-xl border border-accent/40 bg-accent/15 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-forest-800">Harga jasa / layanan</p><p className="mt-1 text-lg font-bold text-forest-950">Mulai {formatRupiah(startingPrice)}</p><p className="mt-1 text-[10px] leading-4 text-muted">Harga akhir menyesuaikan detail pekerjaan dan kebutuhan Anda.</p></div>}<form onSubmit={submit} className="mt-5 space-y-3"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-forest-700" placeholder="Nama Anda" /><input required value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-forest-700" placeholder="Nomor WhatsApp atau email" /><textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={5} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs outline-none focus:border-forest-700" placeholder="Jelaskan kebutuhan, ukuran, jumlah, jadwal, atau detail lain yang relevan." /><button disabled={state.loading} className="inline-flex min-h-11 items-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white disabled:opacity-50"><Send size={14} className="mr-2" />{state.loading ? "Mengirim..." : "Kirim permintaan"}</button></form>{state.message && <p className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-[10px] leading-5 ${state.success ? "bg-green-100 text-forest-800" : "bg-amber-100 text-amber-900"}`}>{state.success && <CheckCircle2 size={14} className="mt-0.5 shrink-0" />}{state.message}</p>}<div className="mt-5 border-t border-forest-700/10 pt-4"><p className="text-[10px] font-bold text-forest-900">Ingin mengirim permintaan langsung?</p><p className="mt-1 text-[10px] text-muted">Chat kontak pemesanan untuk konsultasi produk atau jasa.</p><div className="mt-2 flex flex-wrap gap-2">{orderingContacts.map((contact) => <a key={contact.number} href={orderingWhatsappUrl(contact.number, "Halo, saya ingin mengirim permintaan jasa/layanan.")} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-lg bg-[#25D366] px-3 text-[10px] font-bold text-white"><MessageCircle size={13} className="mr-1.5" />{contact.label}</a>)}</div></div></div>;
}
