import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { syncAuthUser } from "@/lib/auth-profile";
import { getPublicOrigin } from "@/lib/auth-redirect";

const recoveryCookie = "umkm_password_recovery";
const pendingRecoveryCookie = "umkm_pending_password_reset";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectOrigin = getPublicOrigin(request);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const pendingChallengeId = cookies().get(pendingRecoveryCookie)?.value || "";
  const isRecovery = Boolean(pendingChallengeId) || type === "recovery";
  let recoveryChallengeId: string | null = null;

  if (code || (tokenHash && type)) {
    const supabase = createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash as string, type: type as EmailOtpType });
    if (error) {
      const destination = isRecovery ? "/akun/reset-password?error=expired" : "/akun/login?callback_error=1";
      const response = NextResponse.redirect(new URL(destination, redirectOrigin));
      if (isRecovery) response.cookies.delete(pendingRecoveryCookie);
      return response;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (isRecovery) {
      const now = new Date();
      const challenge = user?.email && pendingChallengeId
        ? await prisma.passwordResetChallenge.findFirst({ where: {
          id: pendingChallengeId,
          email: user.email.trim().toLowerCase(),
          authUserId: null,
          expiresAt: { gt: now },
          verifiedAt: null,
          usedAt: null,
        }, select: { id: true } }).catch(() => null)
        : null;
      if (!user?.email || !challenge) {
        await supabase.auth.signOut();
        const response = NextResponse.redirect(new URL("/akun/reset-password?error=invalid", redirectOrigin));
        response.cookies.delete(pendingRecoveryCookie);
        return response;
      }
      const verified = await prisma.passwordResetChallenge.updateMany({ where: {
        id: challenge.id,
        authUserId: null,
        verifiedAt: null,
        usedAt: null,
        expiresAt: { gt: now },
      }, data: { authUserId: user.id, verifiedAt: now } }).catch(() => ({ count: 0 }));
      if (verified.count !== 1) {
        await supabase.auth.signOut();
        const response = NextResponse.redirect(new URL("/akun/reset-password?error=invalid", redirectOrigin));
        response.cookies.delete(pendingRecoveryCookie);
        return response;
      }
      recoveryChallengeId = challenge.id;
    }
    if (user && process.env.DATABASE_URL) {
      try {
        await syncAuthUser(user);
      } catch {
        // Auth callback must still complete when the optional profile database is unavailable.
      }
    }
  }

  if (isRecovery && !recoveryChallengeId) {
    const response = NextResponse.redirect(new URL("/akun/reset-password?error=invalid", redirectOrigin));
    response.cookies.delete(pendingRecoveryCookie);
    return response;
  }

  const response = NextResponse.redirect(new URL(isRecovery ? "/akun/reset-password" : "/", redirectOrigin));
  if (isRecovery) response.cookies.delete(pendingRecoveryCookie);
  if (recoveryChallengeId) response.cookies.set(recoveryCookie, recoveryChallengeId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 });
  return response;
}
