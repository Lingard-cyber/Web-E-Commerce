import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getPublicOrigin } from "@/lib/auth-redirect";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Format email belum valid." }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Layanan pemulihan akun belum dikonfigurasi." }, { status: 503 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return NextResponse.json({ error: "Layanan autentikasi belum dikonfigurasi di server." }, { status: 503 });
  }

  const now = new Date();
  const emailWindow = new Date(now.getTime() - 15 * 60 * 1000);
  let challengeId: string | null = null;
  try {
    await prisma.passwordResetChallenge.deleteMany({ where: { expiresAt: { lt: now } } });
    const recentRequests = await prisma.passwordResetChallenge.count({ where: { email, createdAt: { gte: emailWindow } } });
    if (recentRequests >= 3) return NextResponse.json({ ok: true });

    const challenge = await prisma.passwordResetChallenge.create({ data: {
      email,
      expiresAt: new Date(now.getTime() + 20 * 60 * 1000),
    }, select: { id: true } });
    challengeId = challenge.id;

    cookies().set("umkm_pending_password_reset", challenge.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 20 * 60 });
    const callback = new URL("/auth/callback", getPublicOrigin(request)).toString();
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: callback.toString() });
    if (error) {
      console.error("Password reset email request failed", { code: error.code || "unknown", status: error.status || 0 });
      await prisma.passwordResetChallenge.delete({ where: { id: challenge.id } });
      cookies().delete("umkm_pending_password_reset");
      return NextResponse.json({ error: getAuthErrorMessage(error.message, error.code) }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    if (challengeId) await prisma.passwordResetChallenge.delete({ where: { id: challengeId } }).catch(() => undefined);
    cookies().delete("umkm_pending_password_reset");
    return NextResponse.json({ error: "Permintaan reset belum dapat diproses. Silakan coba lagi beberapa saat." }, { status: 503 });
  }
}
