import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getPublicOrigin } from "@/lib/auth-redirect";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    // Supabase intentionally hides whether an email exists in public recovery requests.
    // This app asks for explicit feedback, so check Auth users with the server-only admin key.
    const admin = createAdminClient();
    const exists = await findAuthUser(admin, email);
    if (!exists) return NextResponse.json({ error: "Email tidak terdaftar. Periksa kembali atau buat akun terlebih dahulu." }, { status: 404 });

    await prisma.passwordResetChallenge.deleteMany({ where: { expiresAt: { lt: now } } });
    const recentRequests = await prisma.passwordResetChallenge.count({ where: { email, createdAt: { gte: emailWindow } } });
    if (recentRequests >= 3) {
      return NextResponse.json({ error: "Permintaan reset terlalu sering. Tunggu beberapa saat sebelum meminta tautan lagi." }, { status: 429 });
    }

    const challenge = await prisma.passwordResetChallenge.create({ data: {
      email,
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    }, select: { id: true } });
    challengeId = challenge.id;

    cookies().set("umkm_pending_password_reset", challenge.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 5 * 60 });
    const callback = new URL("/auth/callback", getPublicOrigin(request)).toString();
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: callback });
    if (error) {
      console.error("Password reset email request failed", { code: error.code || "unknown", status: error.status || 0 });
      await prisma.passwordResetChallenge.delete({ where: { id: challenge.id } });
      cookies().delete("umkm_pending_password_reset");
      return NextResponse.json({ error: getAuthErrorMessage(error.message, error.code) }, { status: 400 });
    }
    return NextResponse.json({ ok: true, expiresIn: 300 });
  } catch {
    if (challengeId) await prisma.passwordResetChallenge.delete({ where: { id: challengeId } }).catch(() => undefined);
    cookies().delete("umkm_pending_password_reset");
    return NextResponse.json({ error: "Permintaan reset belum dapat diproses. Silakan coba lagi beberapa saat." }, { status: 503 });
  }
}

async function findAuthUser(admin: ReturnType<typeof createAdminClient>, email: string) {
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data.users;
    if (users.some((user) => user.email?.trim().toLowerCase() === email)) return true;
    if (users.length < 1000) return false;
  }
  return false;
}
