type PaymentSessionInput = {
  referenceId: string;
  amount: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  siteUrl: string;
};

type PaymentSessionResponse = {
  payment_session_id?: string;
  payment_link_url?: string;
  components_sdk_key?: string;
};

export async function createXenditPaymentSession(input: PaymentSessionInput) {
  const apiKey = process.env.XENDIT_SECRET_KEY;
  if (!apiKey) throw new Error("XENDIT_SECRET_KEY belum dikonfigurasi.");
  const siteOrigin = new URL(input.siteUrl);
  if (siteOrigin.protocol !== "https:") throw new Error("Xendit Components membutuhkan HTTPS. Jalankan aplikasi lokal dengan npm run dev atau gunakan HTTPS tunnel.");
  const response = await fetch("https://api.xendit.co/sessions", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reference_id: input.referenceId, session_type: "PAY", mode: "COMPONENTS", amount: input.amount, currency: "IDR", country: "ID", locale: "id", allow_save_payment_method: "DISABLED", customer: { reference_id: input.referenceId, type: "INDIVIDUAL", email: input.email, mobile_number: input.phone || undefined, individual_detail: input.name ? { given_names: input.name } : undefined }, description: `Pembayaran pesanan ${input.referenceId}`, components_configuration: { origins: [siteOrigin.origin], return_url: `${siteOrigin.origin}/pesanan/${input.referenceId}?payment=return` } }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({})) as PaymentSessionResponse & { error_code?: string; message?: string };
  if (!response.ok || !result.payment_session_id || !result.components_sdk_key) throw new Error(result.message || result.error_code || "Payment session Xendit gagal dibuat.");
  return result;
}

export async function getXenditComponentsSdkKey(sessionId: string) {
  const apiKey = process.env.XENDIT_SECRET_KEY;
  if (!apiKey) throw new Error("XENDIT_SECRET_KEY belum dikonfigurasi.");
  const response = await fetch(`https://api.xendit.co/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}` },
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({})) as PaymentSessionResponse & { error_code?: string; message?: string };
  if (!response.ok || !result.components_sdk_key) throw new Error(result.message || result.error_code || "Kunci checkout Xendit belum tersedia.");
  return result.components_sdk_key;
}
