"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartItem, hydrateCartFromDatabase, persistCartToDatabase, readCart, writeCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const sync = () => setItems(readCart());
  useEffect(() => {
    let active = true;
    const hydrate = () => { void hydrateCartFromDatabase(readCart()).then((next) => { if (!active) return; writeCart(next); setItems(next); }); };
    sync();
    hydrate();
    window.addEventListener("kepuharjo-cart-updated", sync);
    let unsubscribe = () => {};
    try { const supabase = createClient(); const listener = supabase.auth.onAuthStateChange(() => hydrate()); unsubscribe = () => listener.data.subscription.unsubscribe(); } catch { /* Auth is optional for guest carts. */ }
    return () => { active = false; window.removeEventListener("kepuharjo-cart-updated", sync); unsubscribe(); };
  }, []);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const update = (next: CartItem[]) => { setItems(next); writeCart(next); void persistCartToDatabase(next); };

  return <div className="relative"><button onClick={() => setOpen((value) => !value)} className={`relative grid h-9 w-9 place-items-center rounded-full border ${open ? "border-accent bg-accent text-forest-950" : "border-slate-200 bg-white text-forest-950 hover:border-accent hover:text-accent"}`} aria-label="Buka keranjang" aria-expanded={open}><ShoppingBag size={15} />{count > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[8px] font-bold text-forest-950">{count}</span>}</button>{open && <><button className="fixed inset-0 z-40 cursor-default" aria-label="Tutup keranjang" onClick={() => setOpen(false)} /><div className="animate-modal-in absolute right-0 top-12 z-50 w-[min(370px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-slate-200 bg-white text-ink shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-sm font-bold">Keranjang Anda</p><p className="mt-1 text-[10px] text-muted">{count} item tersimpan</p></div><button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-muted hover:bg-green-50 hover:text-forest-800" aria-label="Tutup keranjang"><X size={15} /></button></div>{items.length === 0 ? <div className="px-5 py-10 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-green-50 text-forest-700"><ShoppingBag size={20} /></span><p className="mt-4 text-sm font-bold">Keranjang masih kosong</p><p className="mt-2 text-[10px] leading-5 text-muted">Produk terverifikasi yang Anda pilih akan muncul di sini.</p><Link href="/belanja" onClick={() => setOpen(false)} className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white">Jelajahi katalog <ArrowRight size={13} className="ml-2" /></Link></div> : <><div className="max-h-72 space-y-2 overflow-y-auto p-4">{items.map((item) => <div key={`${item.productSlug}-${item.variantId}`} className="flex items-center gap-3 rounded-2xl bg-[#f5f8f4] p-3"><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold">{item.productName}</p><p className="mt-1 truncate text-[9px] text-muted">{item.variantLabel} · {formatRupiah(item.unitPrice)}</p><div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1"><button onClick={() => update(items.map((value) => value === item ? { ...value, quantity: Math.max(1, value.quantity - 1) } : value))} aria-label="Kurangi jumlah"><Minus size={10} /></button><span className="w-4 text-center text-[10px]">{item.quantity}</span><button onClick={() => update(items.map((value) => value === item ? { ...value, quantity: value.quantity + 1 } : value))} aria-label="Tambah jumlah"><Plus size={10} /></button></div></div><button onClick={() => update(items.filter((value) => value !== item))} className="text-red-600 hover:scale-110" aria-label={`Hapus ${item.productName}`}><Trash2 size={14} /></button></div>)}</div><div className="border-t border-slate-100 p-5"><div className="flex items-center justify-between text-sm"><span>Total sementara</span><strong className="text-forest-800">{formatRupiah(total)}</strong></div><p className="mt-2 text-[9px] leading-4 text-muted">Ongkir dihitung pada tahap checkout setelah area layanan tersedia.</p><div className="mt-4 grid grid-cols-2 gap-2"><Link href="/keranjang" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-forest-800 text-[10px] font-bold text-forest-800">Lihat keranjang</Link><Link href="/checkout" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl bg-forest-800 px-4 text-[10px] font-bold text-white">Checkout <ArrowRight size={13} className="ml-2" /></Link></div></div></>}</div></>}</div>;
}
