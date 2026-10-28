import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function CheckoutPage() {
  return <SiteShell><main className="mx-auto max-w-[780px] px-4 py-20 text-center sm:px-6"><h1 className="font-display text-4xl font-bold">Checkout akan tersedia menyusul.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">Saat ini Anda dapat memilih produk dan menyimpannya di keranjang. Harga, stok, pengiriman, dan pembayaran akan dikonfirmasi sebelum checkout dibuka.</p><Link href="/keranjang" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-forest-800 px-5 text-xs font-bold text-white">Kembali ke keranjang</Link></main></SiteShell>;
}
