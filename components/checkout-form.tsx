"use client";

import Link from "next/link";
import { ArrowRight, Home, LoaderCircle, LockKeyhole, MapPin, Phone, Plus, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartItem, persistCartToDatabase, readCart, writeCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/catalog-utils";
import { XenditComponentsCheckout } from "@/components/xendit-components-checkout";

type CheckoutAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  village: string | null;
  district: string | null;
  regency: string | null;
  postalCode: string | null;
  isDefault: boolean;
};

const emptyAddressDraft = { label: "Rumah", recipientName: "", phone: "", address: "", village: "", district: "", regency: "", postalCode: "" };

export function CheckoutForm({ addresses }: { addresses: CheckoutAddress[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedAddresses, setSavedAddresses] = useState(addresses);
  const [selectedAddressId, setSelectedAddressId] = useState(() => addresses.find((address) => address.isDefault)?.id || addresses[0]?.id || "");
  const [addressDraft, setAddressDraft] = useState(emptyAddressDraft);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentSetup, setPaymentSetup] = useState<{ publicCode: string; sdkKey: string; amount: number } | null>(null);
  const [state, setState] = useState({ loading: false, error: "" });

  useEffect(() => setItems(readCart()), []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

  const saveAddress = async () => {
    if (!addressDraft.recipientName.trim() || !addressDraft.phone.trim() || !addressDraft.address.trim()) {
      return setState({ loading: false, error: "Isi nama penerima, nomor telepon, dan alamat lengkap." });
    }
    setSavingAddress(true);
    setState({ loading: false, error: "" });
    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addressDraft, isDefault: savedAddresses.length === 0 }),
      });
      const result = await response.json().catch(() => ({})) as { address?: CheckoutAddress; error?: string };
      if (!response.ok || !result.address) return setState({ loading: false, error: result.error || "Alamat belum dapat disimpan." });
      setSavedAddresses((current) => [result.address!, ...current]);
      setSelectedAddressId(result.address.id);
      setAddressDraft(emptyAddressDraft);
    } catch {
      setState({ loading: false, error: "Koneksi bermasalah. Alamat belum dapat disimpan." });
    } finally {
      setSavingAddress(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) return setState({ loading: false, error: "Keranjang masih kosong." });
    if (!selectedAddressId) return setState({ loading: false, error: "Pilih alamat pengiriman terlebih dahulu." });
    setState({ loading: true, error: "" });

    try {
      const canonicalItems = await persistCartToDatabase(items);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          items: canonicalItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          addressId: selectedAddressId,
        }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; componentsSdkKey?: string; publicCode?: string };
      if (!response.ok) return setState({ loading: false, error: result.error || "Pesanan belum dapat diproses. Silakan coba lagi." });
      if (!result.publicCode || !result.componentsSdkKey) return setState({ loading: false, error: "Sesi pembayaran belum dapat disiapkan. Coba ulangi checkout." });
      writeCart([]);
      await persistCartToDatabase([]);
      setPaymentSetup({ publicCode: result.publicCode, sdkKey: result.componentsSdkKey, amount: total });
    } catch {
      setState({ loading: false, error: "Koneksi bermasalah. Periksa koneksi internet lalu coba lagi." });
    }
  };

  if (!items.length) {
    return <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white p-10 text-center shadow-card"><h1 className="font-display text-3xl font-bold">Keranjang masih kosong.</h1><p className="mt-3 text-sm text-muted">Tambahkan produk terlebih dahulu sebelum melanjutkan pembayaran.</p><Link href="/belanja" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-forest-800 px-5 text-[10px] font-bold text-white">Kembali belanja <ArrowRight size={14} className="ml-2" /></Link></div>;
  }

  if (paymentSetup) return <XenditComponentsCheckout sdkKey={paymentSetup.sdkKey} publicCode={paymentSetup.publicCode} amount={paymentSetup.amount} />;

  return <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start gap-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-forest-800"><MapPin size={18} /></span><div><h1 className="font-display text-2xl font-bold">Pilih alamat pengiriman</h1><p className="mt-1 text-xs leading-5 text-muted">{savedAddresses.length ? "Alamat utama dipilih otomatis. Anda juga dapat memilih alamat lain." : "Isi alamat pengiriman Anda di sini untuk melanjutkan."}</p></div></div></div>

        {savedAddresses.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-forest-700/30 bg-[#f5f8f4] p-5"><div className="text-center"><Home size={24} className="mx-auto text-forest-700" /><p className="mt-3 text-sm font-bold text-forest-950">Belum ada alamat tersimpan</p><p className="mt-1 text-xs leading-5 text-muted">Tambahkan alamat pengiriman di bawah ini.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-bold text-ink">Label alamat<input value={addressDraft.label} onChange={(event) => setAddressDraft({ ...addressDraft, label: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" placeholder="Rumah" /></label><label className="text-[10px] font-bold text-ink">Nama penerima *<input value={addressDraft.recipientName} onChange={(event) => setAddressDraft({ ...addressDraft, recipientName: event.target.value })} required className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" autoComplete="name" /></label><label className="text-[10px] font-bold text-ink">Nomor telepon *<input value={addressDraft.phone} onChange={(event) => setAddressDraft({ ...addressDraft, phone: event.target.value })} required type="tel" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" autoComplete="tel" /></label><label className="text-[10px] font-bold text-ink sm:col-span-2">Alamat lengkap *<textarea value={addressDraft.address} onChange={(event) => setAddressDraft({ ...addressDraft, address: event.target.value })} required rows={3} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-forest-700" autoComplete="street-address" /></label><label className="text-[10px] font-bold text-ink">Desa / kelurahan<input value={addressDraft.village} onChange={(event) => setAddressDraft({ ...addressDraft, village: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" /></label><label className="text-[10px] font-bold text-ink">Kecamatan<input value={addressDraft.district} onChange={(event) => setAddressDraft({ ...addressDraft, district: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" /></label><label className="text-[10px] font-bold text-ink">Kabupaten / kota<input value={addressDraft.regency} onChange={(event) => setAddressDraft({ ...addressDraft, regency: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" /></label><label className="text-[10px] font-bold text-ink">Kode pos<input value={addressDraft.postalCode} onChange={(event) => setAddressDraft({ ...addressDraft, postalCode: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" autoComplete="postal-code" /></label></div><div className="mt-4 flex justify-center"><button type="button" onClick={saveAddress} disabled={savingAddress} className="inline-flex min-h-10 items-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white disabled:opacity-60"><Plus size={14} className="mr-2" />{savingAddress ? "Menyimpan alamat..." : "Simpan alamat"}</button></div></div> : <fieldset className="mt-6 space-y-3"><legend className="mb-3 text-[11px] font-bold text-ink">Pilih salah satu alamat</legend>{savedAddresses.map((address) => {
          const selected = selectedAddressId === address.id;
          const locality = [address.village, address.district, address.regency, address.postalCode].filter(Boolean).join(", ");
          return <label key={address.id} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${selected ? "border-forest-700 bg-green-50/70 ring-2 ring-green-100" : "border-slate-200 bg-white hover:border-green-300"}`}>
            <input type="radio" name="shipping-address" value={address.id} checked={selected} onChange={() => setSelectedAddressId(address.id)} className="mt-1 h-4 w-4 shrink-0 accent-forest-800" />
            <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-forest-950">{address.label || "Alamat"}</strong>{address.isDefault && <span className="rounded-full bg-forest-800 px-2 py-1 text-[9px] font-bold text-white">Alamat utama</span>}</span><span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-700"><span className="inline-flex items-center gap-1.5"><UserRound size={13} />{address.recipientName}</span><span className="inline-flex items-center gap-1.5"><Phone size={13} />{address.phone}</span></span><span className="mt-2 block whitespace-pre-line text-xs leading-5 text-slate-600">{address.address}</span>{locality && <span className="mt-1 block text-[11px] leading-5 text-muted">{locality}</span>}</span>
          </label>;
        })}</fieldset>}
      </section>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-xs text-red-700">{state.error}{state.error.includes("masuk") && <><br /><Link href="/akun/login?next=/checkout" className="mt-2 inline-block font-bold underline">Masuk ke akun</Link></>}</p>}
    </div>
    <aside className="h-fit rounded-3xl bg-forest-900 text-white shadow-xl lg:sticky lg:top-24">
      <div className="p-6 sm:p-7"><p className="text-[10px] uppercase tracking-widest text-white/55">Ringkasan pesanan</p><div className="mt-5 space-y-3">{items.map((item) => <div key={`${item.productSlug}-${item.variantId}`} className="flex justify-between gap-3 text-xs"><span className="min-w-0"><span className="block truncate">{item.productName}</span><small className="text-white/55">{item.variantLabel} × {item.quantity}</small></span><strong className="shrink-0">{formatRupiah(item.unitPrice * item.quantity)}</strong></div>)}</div><div className="my-5 border-t border-white/10" /><div className="flex justify-between text-lg"><span className="font-display font-bold">Total</span><strong className="text-accent">{formatRupiah(total)}</strong></div><button disabled={state.loading || !selectedAddressId} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent text-[11px] font-bold text-forest-950 disabled:cursor-not-allowed disabled:opacity-60">{state.loading ? <LoaderCircle size={15} className="mr-2 animate-spin" /> : <LockKeyhole size={15} className="mr-2" />}{state.loading ? "Menyiapkan pembayaran..." : "Lanjut ke pembayaran"}</button></div>
    </aside>
  </form>;
}
