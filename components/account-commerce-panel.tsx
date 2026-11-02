"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, MapPin, Package, Plus, RefreshCw, Trash2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/catalog-utils";
import { persistCartToDatabase, readCart, writeCart } from "@/lib/cart";

type Address = { id: string; label: string; recipientName: string; phone: string; address: string; village?: string | null; district?: string | null; regency?: string | null; postalCode?: string | null; isDefault: boolean };
type OrderItem = { productName: string; variantId: string; variantLabel: string; quantity: number; unitPriceIdr: number; available: boolean; productSlug: string };
type Order = { publicCode: string; status: string; totalIdr: number; createdAt: string; payment?: { status: string } | null; shipment?: { status: string; courier?: string | null; trackingNumber?: string | null } | null; items: OrderItem[] };
type AddressDraft = Omit<Address, "id" | "isDefault"> & { isDefault: boolean };

const emptyAddress: AddressDraft = { label: "Rumah", recipientName: "", phone: "", address: "", village: "", district: "", regency: "Sleman", postalCode: "", isDefault: false };

export function AccountCommercePanel() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/account", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json() as { addresses: Address[]; orders: Order[] };
      setAddresses(data.addresses || []);
      setOrders(data.orders || []);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const addAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const result = await response.json().catch(() => ({})) as { address?: Address; error?: string };
    setSaving(false);
    if (!response.ok || !result.address) return setMessage(result.error || "Alamat belum dapat disimpan.");
    setAddresses((current) => draft.isDefault ? [result.address!, ...current.map((item) => ({ ...item, isDefault: false }))] : [result.address!, ...current]);
    setDraft(emptyAddress);
    setShowAddressForm(false);
    setMessage("Alamat berhasil disimpan.");
  };

  const deleteAddress = async (id: string) => {
    const response = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (response.ok) setAddresses((current) => current.filter((item) => item.id !== id));
    else setMessage("Alamat belum dapat dihapus.");
  };

  const buyAgain = async (order: Order) => {
    const availableItems = order.items.filter((item) => item.available);
    if (!availableItems.length) return setMessage("Tidak ada item dari pesanan ini yang masih tersedia.");
    const cart = readCart();
    for (const item of availableItems) {
      const existing = cart.find((value) => value.variantId === item.variantId);
      if (existing) existing.quantity += item.quantity;
      else cart.push({ productSlug: item.productSlug, productName: item.productName, variantId: item.variantId, variantLabel: item.variantLabel, unitPrice: item.unitPriceIdr, quantity: item.quantity });
    }
    writeCart(await persistCartToDatabase(cart));
    setMessage(`${availableItems.length} item dimasukkan kembali ke keranjang.`);
  };

  if (loading) return <div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="h-48 animate-pulse rounded-2xl bg-slate-100" /><div className="h-48 animate-pulse rounded-2xl bg-slate-100" /></div>;

  return <div className="mt-6 space-y-6"><div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold text-forest-950"><MapPin size={16} />Alamat tersimpan</h3><p className="mt-1 text-[10px] leading-5 text-muted">Alamat checkout Anda tersimpan di sini.</p></div><button type="button" onClick={() => setShowAddressForm((value) => !value)} className="inline-flex h-9 items-center gap-1 rounded-lg bg-forest-800 px-3 text-[10px] font-bold text-white"><Plus size={13} />Tambah</button></div>{showAddressForm && <form onSubmit={addAddress} className="mt-5 space-y-3 rounded-xl bg-[#f5f8f4] p-4"><div className="grid gap-3 sm:grid-cols-2"><SmallField label="Label" value={draft.label} onChange={(value) => setDraft({ ...draft, label: value })} /><SmallField label="Nama penerima" value={draft.recipientName} onChange={(value) => setDraft({ ...draft, recipientName: value })} required /><SmallField label="Nomor telepon" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} required /><label className="block text-[10px] font-bold sm:col-span-2">Alamat lengkap<textarea required value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-forest-700" /></label></div><label className="flex items-center gap-2 text-[10px] font-bold"><input type="checkbox" checked={draft.isDefault} onChange={(event) => setDraft({ ...draft, isDefault: event.target.checked })} />Jadikan alamat utama</label><button disabled={saving} className="h-10 rounded-lg bg-forest-800 px-4 text-[10px] font-bold text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan alamat"}</button></form>}{addresses.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-xs text-muted">Belum ada alamat tersimpan.</p> : <div className="mt-5 space-y-3">{addresses.map((address) => <div key={address.id} className="rounded-xl border border-slate-100 p-3.5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><strong className="text-xs">{address.label}</strong>{address.isDefault && <span className="rounded-full bg-green-100 px-2 py-1 text-[8px] font-bold text-forest-800">Utama</span>}</div><p className="mt-1 text-[10px] font-semibold">{address.recipientName} · {address.phone}</p><p className="mt-1 text-[10px] leading-5 text-muted">{address.address}</p></div><button type="button" onClick={() => deleteAddress(address.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label={`Hapus alamat ${address.label}`}><Trash2 size={14} /></button></div></div>)}</div>}</section><section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold text-forest-950"><Package size={16} />Riwayat pesanan</h3><p className="mt-1 text-[10px] leading-5 text-muted">Pesanan terakhir dan status pemenuhannya.</p></div></div>{orders.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-xs text-muted">Belum ada riwayat pesanan.</p> : <div className="mt-5 space-y-3">{orders.map((order) => <div key={order.publicCode} className="rounded-xl border border-slate-100 p-3.5"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/pesanan/${order.publicCode}`} className="text-xs font-bold text-forest-800 hover:underline">{order.publicCode}</Link><p className="mt-1 text-[10px] text-muted">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(order.createdAt))}</p></div><StatusPill status={order.status} /></div><div className="mt-3 flex items-center gap-3 text-[10px] text-muted"><span className="flex items-center gap-1"><Clock3 size={13} />{labelStatus(order.payment?.status || "pending")}</span><span className="flex items-center gap-1"><Truck size={13} />{labelStatus(order.shipment?.status || "pending")}</span><strong className="ml-auto text-forest-800">{formatRupiah(order.totalIdr)}</strong></div><p className="mt-3 text-[10px] leading-5 text-muted">{order.items.map((item) => `${item.productName} · ${item.variantLabel} ×${item.quantity}`).join("; ")}</p><div className="mt-3 flex justify-end"><button type="button" onClick={() => buyAgain(order)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-forest-800 px-3 text-[10px] font-bold text-forest-800 hover:bg-green-50"><RefreshCw size={13} />Beli lagi</button></div></div>)}</div>}</section></div>{message && <p className="rounded-xl bg-green-50 p-3 text-[10px] text-forest-800">{message}</p>}</div>;
}

function SmallField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-[10px] font-bold">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-forest-700" /></label>; }
function labelStatus(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function StatusPill({ status }: { status: string }) { return <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${status === "completed" || status === "paid" ? "bg-green-100 text-forest-800" : status === "cancelled" || status === "expired" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{labelStatus(status)}</span>; }
