import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { PASSWORD_RESET_OTP_TTL_MS, PASSWORD_RESET_OTP_TTL_SECONDS } from "@/lib/password-reset-constants";

const pendingCookie = "umkm_pending_password_reset";
const recoveryCookie = "umkm_password_recovery";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const token = typeof body?.token === "string" ? body.token.replace(/\s/g, "") : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Format email belum valid." }, { status: 400 });
  if (!/^\d{6}$/.test(token)) return NextResponse.json({ error: "Masukkan kode OTP 6 digit." }, { status: 400 });

  const challengeId = cookies().get(pendingCookie)?.value;
  if (!challengeId) return NextResponse.json({ error: "Permintaan kode sudah kedaluwarsa. Minta kode baru." }, { status: 410 });

  const challenge = await prisma.passwordResetChallenge.findFirst({ where: {
    id: challengeId,
    email,
    authUserId: null,
    verifiedAt: null,
    usedAt: null,
    expiresAt: { gt: new Date() },
  }, select: { id: true } });
  if (!challenge) return NextResponse.json({ error: "Kode OTP salah atau sudah kedaluwarsa. Minta kode baru." }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (error || !data.user?.id || data.user.email?.trim().toLowerCase() !== email) {
    console.error("Password reset OTP verification failed", { code: error?.code || "user_mismatch", status: error?.status || 0 });
    return NextResponse.json({ error: error ? getAuthErrorMessage(error.message, error.code) : "Kode OTP tidak cocok dengan email akun." }, { status: 400 });
  }

  const now = new Date();
  const verified = await prisma.passwordResetChallenge.updateMany({ where: {
    id: challenge.id,
    email,
    authUserId: null,
    verifiedAt: null,
    usedAt: null,
    expiresAt: { gt: now },
  }, data: { authUserId: data.user.id, verifiedAt: now, expiresAt: new Date(now.getTime() + PASSWORD_RESET_OTP_TTL_MS) } });
  if (verified.count !== 1) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Kode OTP sudah tidak berlaku. Minta kode baru." }, { status: 410 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(recoveryCookie, challenge.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: PASSWORD_RESET_OTP_TTL_SECONDS });
  response.cookies.set(pendingCookie, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}
