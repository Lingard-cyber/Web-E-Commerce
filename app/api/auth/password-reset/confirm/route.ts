import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const recoveryCookie = "umkm_password_recovery";

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) return NextResponse.json({ error: "Sesi pemulihan tidak valid atau sudah kedaluwarsa." }, { status: 401 });
  const challenge = await findChallenge(request, user.id, user.email);
  if (!challenge) return NextResponse.json({ error: "Buka tautan pemulihan dari email sebelum mengganti kata sandi." }, { status: 403 });
  return NextResponse.json({ email: user.email });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length < 8) return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) return NextResponse.json({ error: "Sesi pemulihan tidak valid atau sudah kedaluwarsa." }, { status: 401 });
  const challenge = await findChallenge(request, user.id, user.email);
  if (!challenge) return NextResponse.json({ error: "Tautan reset sudah tidak aktif. Minta tautan baru." }, { status: 403 });
  const now = new Date();
  const claimed = await prisma.passwordResetChallenge.updateMany({ where: {
    id: challenge.id,
    authUserId: user.id,
    email: user.email.trim().toLowerCase(),
    verifiedAt: { not: null },
    usedAt: null,
    expiresAt: { gt: now },
  }, data: { usedAt: now } });
  if (claimed.count !== 1) return NextResponse.json({ error: "Tautan reset sudah dipakai atau kedaluwarsa. Minta tautan baru." }, { status: 403 });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    await prisma.passwordResetChallenge.updateMany({ where: { id: challenge.id, usedAt: now }, data: { usedAt: null } });
    return NextResponse.json({ error: error.message.toLowerCase().includes("session") ? "Tautan pemulihan sudah tidak aktif. Minta tautan baru." : error.message }, { status: 400 });
  }

  await supabase.auth.signOut();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(recoveryCookie, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}

async function findChallenge(request: Request, authUserId: string, email: string) {
  const challengeId = request.headers.get("cookie")?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${recoveryCookie}=`))
    ?.slice(recoveryCookie.length + 1);
  if (!challengeId) return null;
  return prisma.passwordResetChallenge.findFirst({ where: {
    id: challengeId,
    authUserId,
    email: email.trim().toLowerCase(),
    verifiedAt: { not: null },
    usedAt: null,
    expiresAt: { gt: new Date() },
  }, select: { id: true } });
}
