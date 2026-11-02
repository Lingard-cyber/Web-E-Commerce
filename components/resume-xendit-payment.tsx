"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { XenditComponentsCheckout } from "@/components/xendit-components-checkout";

export function ResumeXenditPayment({ publicCode }: { publicCode: string }) {
  const [payment, setPayment] = useState<{ sdkKey: string; amount: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch(`/api/orders/${encodeURIComponent(publicCode)}/payment-session`, { method: "POST" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({})) as { componentsSdkKey?: string; amount?: number; error?: string };
        if (!response.ok || !result.componentsSdkKey || typeof result.amount !== "number") throw new Error(result.error || "Sesi pembayaran belum dapat dibuat.");
        if (active) setPayment({ sdkKey: result.componentsSdkKey, amount: result.amount });
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Sesi pembayaran belum dapat dibuat."); });
    return () => { active = false; };
  }, [publicCode]);

  if (payment) return <XenditComponentsCheckout sdkKey={payment.sdkKey} publicCode={publicCode} amount={payment.amount} />;
  if (error) return <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p>;
  return <div className="flex items-center justify-center gap-2 rounded-xl bg-white p-6 text-sm text-muted"><LoaderCircle size={18} className="animate-spin text-forest-700" />Menyiapkan sesi pembayaran...</div>;
}
