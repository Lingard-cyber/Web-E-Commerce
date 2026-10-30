import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUser } from "@/lib/auth-profile";
import { getPublicOrigin } from "@/lib/auth-redirect";

const recoveryCookie = "umkm_password_recovery";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectOrigin = getPublicOrigin(request);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const isRecovery = url.searchParams.get("flow") === "recovery" || type === "recovery";
  let recoveryUserId: string | null = null;

  if (code || (tokenHash && type)) {
    const supabase = createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash as string, type: type as EmailOtpType });
    if (error) {
      const destination = isRecovery ? "/akun/reset-password?error=expired" : "/akun/login?callback_error=1";
      return NextResponse.redirect(new URL(destination, redirectOrigin));
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (isRecovery && user) recoveryUserId = user.id;
    if (user && process.env.DATABASE_URL) {
      try {
        await syncAuthUser(user);
      } catch {
        // Auth callback must still complete when the optional profile database is unavailable.
      }
    }
  }

  const next = url.searchParams.get("next") || (isRecovery ? "/akun/reset-password" : null);
  const response = NextResponse.redirect(new URL(next && next.startsWith("/") && !next.startsWith("//") ? next : "/", redirectOrigin));
  if (recoveryUserId) response.cookies.set(recoveryCookie, recoveryUserId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 });
  return response;
}
