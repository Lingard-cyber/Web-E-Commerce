import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) redirect("/akun/login?next=%2Fcheckout");

  return <SiteShell><main className="mx-auto max-w-[780px] px-4 py-20 text-center sm:px-6"><h1 className="font-display text-4xl font-bold">Checkout akan tersedia menyusul.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">Saat ini Anda dapat memilih produk dan menyimpannya di keranjang. Harga, stok, pengiriman, dan pembayaran akan dikonfirmasi sebelum checkout dibuka.</p><Link href="/keranjang" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-forest-800 px-5 text-xs font-bold text-white">Kembali ke keranjang</Link></main></SiteShell>;
}
