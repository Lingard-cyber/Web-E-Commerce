import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/auth-redirect";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Format email belum valid." }, { status: 400 });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return NextResponse.json({ error: "Layanan autentikasi belum dikonfigurasi di server." }, { status: 503 });
  }

  const supabase = createClient();
  const callback = new URL("/auth/callback", getPublicOrigin(request));
  callback.searchParams.set("flow", "recovery");
  callback.searchParams.set("next", "/akun/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback.toString() });
  if (error) return NextResponse.json({ error: getAuthErrorMessage(error.message) }, { status: 400 });

  // Keep the response generic so the endpoint does not disclose whether an email is registered.
  return NextResponse.json({ ok: true });
}
