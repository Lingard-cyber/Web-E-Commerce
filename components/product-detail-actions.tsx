"use client";

import { ArrowRight, Check, ChevronDown, FileText, Share2, ShoppingBag, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CatalogEntry, formatRupiah } from "@/lib/catalog";
import { readCart, writeCart } from "@/lib/cart";

export function ProductDetailActions({ entry }: { entry: CatalogEntry }) {
  const router = useRouter();
  const pricedVariants = entry.variants.filter((variant) => variant.active && variant.priceIdr !== null);
  const [selectedVariantId, setSelectedVariantId] = useState(pricedVariants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const selectedVariant = useMemo(() => pricedVariants.find((variant) => variant.id === selectedVariantId) || pricedVariants[0], [pricedVariants, selectedVariantId]);
  const disabled = entry.status !== "published" || !selectedVariant;
  const stockLimit = selectedVariant?.stockQty && selectedVariant.stockQty > 0 ? selectedVariant.stockQty : null;
  const subtotal = (selectedVariant?.priceIdr || 0) * quantity;

  const show = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const changeQuantity = (next: number) => {
    const capped = stockLimit ? Math.min(next, stockLimit) : next;
    setQuantity(Math.max(1, capped));
  };

  const addToCart = (goToCheckout = false) => {
    if (!selectedVariant) return show("Produk ini menggunakan alur konsultasi, bukan keranjang.");
    if (stockLimit && quantity > stockLimit) return show(`Jumlah maksimal untuk varian ini adalah ${stockLimit}.`);
    const cart = readCart();
    const existing = cart.find((cartItem) => cartItem.productSlug === entry.slug && cartItem.variantId === selectedVariant.id);
    const nextQuantity = (existing?.quantity || 0) + quantity;
    if (stockLimit && nextQuantity > stockLimit) return show(`Stok tersisa ${stockLimit}; jumlah di keranjang akan melebihi stok.`);
    if (existing) existing.quantity = nextQuantity;
    else cart.push({ productSlug: entry.slug, productName: entry.name, variantId: selectedVariant.id, variantLabel: selectedVariant.label, unitPrice: selectedVariant.priceIdr || 0, quantity });
    writeCart(cart);
    if (goToCheckout) router.push("/checkout");
    else show("Produk berhasil ditambahkan ke keranjang.");
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title: entry.name, text: entry.description, url: window.location.href }).catch(() => undefined);
    else { await navigator.clipboard?.writeText(window.location.href); show("Tautan produk disalin."); }
  };

  if (!pricedVariants.length) return <p className="mt-4 text-[10px] leading-5 text-muted">Layanan ini dipesan melalui formulir konsultasi di bawah. Harga dan detail pekerjaan dibahas bersama pengelola.</p>;

  return <>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-forest-700">Pilih varian</p><span className="text-[10px] text-muted">{pricedVariants.length} pilihan</span></div>
      <div className="mt-3 flex flex-wrap gap-2">{pricedVariants.map((variant) => <button type="button" key={variant.id} onClick={() => { setSelectedVariantId(variant.id); setQuantity(1); }} className={`inline-flex min-h-10 items-center rounded-xl border px-3 text-[10px] font-bold transition ${selectedVariant?.id === variant.id ? "border-forest-800 bg-forest-800 text-white" : "border-slate-200 bg-white text-forest-900 hover:border-forest-700"}`} aria-pressed={selectedVariant?.id === variant.id}>{selectedVariant?.id === variant.id && <Check size={13} className="mr-1.5" />}{variant.label} · {formatRupiah(variant.priceIdr)}</button>)}</div>
      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-forest-950">Atur jumlah</p><p className="mt-1 text-[10px] text-muted">{stockLimit ? `Stok total: ${stockLimit}` : "Stok dikonfirmasi saat checkout"}</p></div><div className="flex items-center gap-3"><div className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white"><button type="button" onClick={() => changeQuantity(quantity - 1)} className="grid h-full w-9 place-items-center text-lg text-muted hover:text-forest-800" aria-label="Kurangi jumlah">−</button><span className="w-8 text-center text-xs font-bold">{quantity}</span><button type="button" onClick={() => changeQuantity(quantity + 1)} className="grid h-full w-9 place-items-center text-lg text-forest-700 hover:text-forest-950" aria-label="Tambah jumlah"><span className="sr-only">Tambah jumlah</span>+</button></div><span className="text-[10px] text-muted">{stockLimit ? `maks. ${stockLimit}` : "jumlah"}</span></div></div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-muted">Subtotal</span><strong className="text-xl text-forest-950">{formatRupiah(subtotal)}</strong></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2"><button disabled={disabled} onClick={() => addToCart()} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-forest-800 text-[11px] font-bold text-forest-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"><ShoppingBag size={15} className="mr-2" />+ Keranjang</button><button disabled={disabled} onClick={() => addToCart(true)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-800 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Beli sekarang <ArrowRight size={15} className="ml-2" /></button></div>
      <div className="mt-4 flex items-center justify-center gap-5 border-t border-slate-100 pt-3 text-[10px] text-muted"><a href="#informasi-produk" className="inline-flex items-center gap-1.5 hover:text-forest-800"><FileText size={13} />Deskripsi</a><button type="button" onClick={() => show("Wishlist akan tersedia setelah akun aktif.")} className="inline-flex items-center gap-1.5 hover:text-forest-800"><Heart size={13} />Wishlist</button><button type="button" onClick={share} className="inline-flex items-center gap-1.5 hover:text-forest-800"><Share2 size={13} />Bagikan</button></div>
    </div>
    <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-5 text-muted"><ChevronDown size={13} className="mt-1 shrink-0 text-forest-700" />Harga dan stok akan dicek kembali saat checkout untuk memastikan pesanan dapat diproses.</p>
    {notice && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest-950 px-4 py-3 text-[11px] text-white shadow-xl">{notice}</div>}
  </>;
}
