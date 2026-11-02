import { SiteShell } from "@/components/site-shell";
import { ResumeXenditPayment } from "@/components/resume-xendit-payment";
import { getCurrentDatabaseUser } from "@/lib/account-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContinuePaymentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentDatabaseUser();
  if (!user) redirect(`/akun/login?next=${encodeURIComponent(`/bayar/${params.id}`)}`);
  return <SiteShell><main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-[900px]"><ResumeXenditPayment publicCode={params.id} /></div></main></SiteShell>;
}
