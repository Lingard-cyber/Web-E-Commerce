"use client";

import Link from "next/link";
import { ArrowRight, Home, LoaderCircle, LockKeyhole, MapPin, Phone, Plus, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartItem, persistCartToDatabase, readCart, writeCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/catalog";

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

export function CheckoutForm({ addresses }: { addresses: CheckoutAddress[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState(() => addresses.find((address) => address.isDefault)?.id || addresses[0]?.id || "");
  const [state, setState] = useState({ loading: false, error: "" });

  useEffect(() => setItems(readCart()), []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

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
      const result = await response.json().catch(() => ({})) as { error?: string; checkoutUrl?: string; publicCode?: string };
      if (!response.ok) return setState({ loading: false, error: result.error || "Pesanan belum dapat diproses. Silakan coba lagi." });
      writeCart([]);
      await persistCartToDatabase([]);
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else if (result.publicCode) window.location.assign(`/pesanan/${result.publicCode}`);
    } catch {
      setState({ loading: false, error: "Koneksi bermasalah. Periksa koneksi internet lalu coba lagi." });
    }
  };

  if (!items.length) {
    return <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white p-10 text-center shadow-card"><h1 className="font-display text-3xl font-bold">Keranjang masih kosong.</h1><p className="mt-3 text-sm text-muted">Tambahkan produk terlebih dahulu sebelum melanjutkan pembayaran.</p><Link href="/belanja" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-forest-800 px-5 text-[10px] font-bold text-white">Kembali belanja <ArrowRight size={14} className="ml-2" /></Link></div>;
  }

  return <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-forest-800"><MapPin size={18} /></span><div><h1 className="font-display text-2xl font-bold">Pilih alamat pengiriman</h1><p className="mt-1 text-xs leading-5 text-muted">Alamat diambil dari profil Anda. Alamat utama dipilih otomatis.</p></div></div><Link href="/akun" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-forest-800 px-3 text-[10px] font-bold text-forest-800 hover:bg-green-50"><Plus size={14} />Kelola alamat</Link></div>

        {addresses.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-forest-700/30 bg-[#f5f8f4] p-6 text-center"><Home size={24} className="mx-auto text-forest-700" /><p className="mt-3 text-sm font-bold text-forest-950">Belum ada alamat tersimpan</p><p className="mt-1 text-xs leading-5 text-muted">Tambahkan alamat di profil agar dapat dipilih untuk pengiriman.</p><Link href="/akun" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white">Tambah alamat di profil</Link></div> : <fieldset className="mt-6 space-y-3"><legend className="mb-3 text-[11px] font-bold text-ink">Pilih salah satu alamat</legend>{addresses.map((address) => {
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
