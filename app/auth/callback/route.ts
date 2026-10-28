import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUser } from "@/lib/auth-profile";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code || (tokenHash && type)) {
    const supabase = createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash as string, type: type as EmailOtpType });
    if (error) return NextResponse.redirect(new URL("/akun/login?callback_error=1", url.origin));

    const { data: { user } } = await supabase.auth.getUser();
    if (user && process.env.DATABASE_URL) {
      try {
        await syncAuthUser(user);
      } catch {
        // Auth callback must still complete when the optional profile database is unavailable.
      }
    }
  }

  const next = url.searchParams.get("next") || (type === "recovery" ? "/akun/reset-password" : null);
  return NextResponse.redirect(new URL(next && next.startsWith("/") && !next.startsWith("//") ? next : "/", url.origin));
}
