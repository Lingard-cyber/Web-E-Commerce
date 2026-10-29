import { SiteShell } from "@/components/site-shell";
import { CheckoutForm } from "@/components/checkout-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) redirect("/akun/login?next=%2Fcheckout");

  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><div className="mb-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Pembayaran aman</p><h1 className="mt-2 font-display text-4xl font-bold text-forest-950">Selesaikan pesanan Anda.</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Isi alamat pengiriman, lalu pilih metode pembayaran yang tersedia.</p></div><CheckoutForm /></main></SiteShell>;
}
