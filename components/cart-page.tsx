"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartItem, persistCartToDatabase, readCart, writeCart } from "@/lib/cart";
import { catalogImagePlaceholder, formatRupiah } from "@/lib/catalog";

export function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("kepuharjo-cart-updated", sync);
    return () => window.removeEventListener("kepuharjo-cart-updated", sync);
  }, []);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const update = (next: CartItem[]) => { setItems(next); writeCart(next); void persistCartToDatabase(next); };

  if (!items.length) return <div className="rounded-3xl border border-dashed border-forest-700/30 bg-white p-10 text-center shadow-card sm:p-16">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-green-50 text-forest-700"><ShoppingCart size={29} /></span>
    <h2 className="mt-6 font-display text-3xl font-bold">Keranjang masih kosong.</h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Pilih produk dari katalog untuk menyimpannya di keranjang.</p>
    <Link href="/belanja" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-forest-800 px-5 text-[10px] font-bold text-white">Jelajahi katalog <ArrowRight size={13} className="ml-2" /></Link>
  </div>;

  return <div>
    <div className="mb-5 flex items-center justify-between"><p className="text-xs text-muted"><strong className="text-ink">{count} item</strong> di keranjang</p><Link href="/belanja" className="inline-flex items-center text-[10px] font-bold text-forest-800"><ArrowLeft size={13} className="mr-2" />Lanjut belanja</Link></div>
    <div className="grid gap-5 lg:grid-cols-[1fr_350px]">
      <div className="space-y-3">{items.map((item) => <div key={item.variantId} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 product-card-shadow sm:gap-4">
        <img src={item.imageSrc || catalogImagePlaceholder} alt={item.productName} className="h-24 w-24 shrink-0 rounded-xl bg-[#eef5ef] object-cover sm:h-28 sm:w-28" />
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-3"><div><Link href={`/produk/${item.productSlug}`} className="text-sm font-bold text-ink hover:text-forest-800">{item.productName}</Link><p className="mt-1 text-[10px] text-muted">{item.variantLabel}</p><p className="mt-2 text-xs font-bold text-forest-800">{formatRupiah(item.unitPrice)}</p></div><button type="button" onClick={() => update(items.filter((value) => value.variantId !== item.variantId))} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600" aria-label={`Hapus ${item.productName}`}><Trash2 size={15} /></button></div>
          <div className="mt-3 flex items-center justify-between gap-3"><div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1"><button type="button" onClick={() => update(items.map((value) => value.variantId === item.variantId ? { ...value, quantity: Math.max(1, value.quantity - 1) } : value))} className="grid h-6 w-6 place-items-center" aria-label="Kurangi jumlah"><Minus size={11} /></button><span className="w-5 text-center text-xs font-bold">{item.quantity}</span><button type="button" onClick={() => update(items.map((value) => value.variantId === item.variantId ? { ...value, quantity: Math.min(99, value.quantity + 1) } : value))} className="grid h-6 w-6 place-items-center" aria-label="Tambah jumlah"><Plus size={11} /></button></div><strong className="text-sm text-forest-800">{formatRupiah(item.unitPrice * item.quantity)}</strong></div>
        </div>
      </div>)}</div>
      <aside className="h-fit rounded-3xl bg-forest-900 p-6 text-white shadow-xl lg:sticky lg:top-24"><p className="text-[10px] uppercase tracking-widest text-white/55">Ringkasan belanja</p><div className="mt-5 flex justify-between text-sm"><span>Subtotal ({count} item)</span><strong>{formatRupiah(total)}</strong></div><div className="my-5 border-t border-white/10" /><div className="flex justify-between text-lg"><span className="font-display font-bold">Total sementara</span><strong className="text-accent">{formatRupiah(total)}</strong></div><Link href="/checkout" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-4 text-[11px] font-bold text-forest-950 hover:bg-yellow-300">Lanjut ke checkout <ArrowRight size={14} className="ml-2" /></Link><p className="mt-4 text-xs leading-5 text-white/70">Belum login? Anda akan diarahkan ke halaman login customer sebelum checkout.</p></aside>
    </div>
  </div>;
}
