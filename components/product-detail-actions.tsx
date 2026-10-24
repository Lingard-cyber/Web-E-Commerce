"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CatalogEntry } from "@/lib/catalog";
import { readCart, writeCart } from "@/lib/cart";

export function ProductDetailActions({ entry }: { entry: CatalogEntry }) {
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const disabled = entry.status !== "published";
  const show = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3500); };
  const addToCart = (goToCheckout = false) => { const item = entry.variants.find((variant) => variant.priceIdr !== null && variant.active); if (!item) return show("Produk ini menggunakan alur konsultasi, bukan keranjang."); const cart = readCart(); const existing = cart.find((cartItem) => cartItem.productSlug === entry.slug && cartItem.variantId === item.id); if (existing) existing.quantity += 1; else cart.push({ productSlug: entry.slug, productName: entry.name, variantId: item.id, variantLabel: item.label, unitPrice: item.priceIdr || 0, quantity: 1 }); writeCart(cart); if (goToCheckout) router.push("/checkout"); else show("Produk berhasil ditambahkan ke keranjang."); };
  return <>{<div className="mt-6 grid gap-2 sm:grid-cols-2"><button disabled={disabled} onClick={() => addToCart()} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-forest-800 text-[11px] font-bold text-forest-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"><ShoppingBag size={15} className="mr-2" />Tambah ke keranjang</button><button disabled={disabled} onClick={() => addToCart(true)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-800 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Beli sekarang <ArrowRight size={15} className="ml-2" /></button></div>}<p className="mt-3 text-[10px] leading-5 text-muted">{disabled ? "Produk ini sedang dilengkapi agar harga, stok, dan proses pesanannya dapat dipastikan." : "Pembelian memerlukan akun dan dilanjutkan melalui checkout aman."}</p>{notice && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest-950 px-4 py-3 text-[11px] text-white shadow-xl">{notice}</div>}</>;
}
