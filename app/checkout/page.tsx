import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user?.email) redirect("/akun/login?next=/checkout");

  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><div className="mb-7"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Checkout aman</p><h1 className="mt-2 font-display text-4xl font-bold">Selesaikan pesanan Anda.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Isi alamat pengiriman. Harga, stok, dan total akan diverifikasi kembali oleh server sebelum pembayaran.</p></div><CheckoutForm /></main></SiteShell>;
}
