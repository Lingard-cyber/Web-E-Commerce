import { SiteShell } from "@/components/site-shell";
import { CheckoutForm } from "@/components/checkout-form";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentDatabaseUser } from "@/lib/account-server";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const databaseUser = await getCurrentDatabaseUser();
  if (!databaseUser) redirect("/akun/login?next=%2Fcheckout");
  const addresses = await prisma.address.findMany({
    where: { userId: databaseUser.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    select: { id: true, label: true, recipientName: true, phone: true, address: true, village: true, district: true, regency: true, postalCode: true, isDefault: true },
  });

  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><div className="mb-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Pembayaran aman</p><h1 className="mt-2 font-display text-4xl font-bold text-forest-950">Selesaikan pesanan Anda.</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">Pilih alamat tersimpan yang akan digunakan untuk pesanan ini.</p></div><CheckoutForm addresses={addresses} /></main></SiteShell>;
}
