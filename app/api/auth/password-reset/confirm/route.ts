import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const recoveryCookie = "umkm_password_recovery";

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) return NextResponse.json({ error: "Sesi pemulihan tidak valid atau sudah kedaluwarsa." }, { status: 401 });
  if (!hasRecoveryCookieFor(request, user.id)) return NextResponse.json({ error: "Buka tautan pemulihan dari email sebelum mengganti kata sandi." }, { status: 403 });
  return NextResponse.json({ email: user.email });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length < 8) return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) return NextResponse.json({ error: "Sesi pemulihan tidak valid atau sudah kedaluwarsa." }, { status: 401 });
  if (!hasRecoveryCookieFor(request, user.id)) return NextResponse.json({ error: "Buka tautan pemulihan dari email sebelum mengganti kata sandi." }, { status: 403 });
  if (email !== user.email.trim().toLowerCase()) return NextResponse.json({ error: "Email konfirmasi tidak cocok dengan email pada tautan pemulihan." }, { status: 400 });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return NextResponse.json({ error: error.message.toLowerCase().includes("session") ? "Tautan pemulihan sudah tidak aktif. Minta tautan baru." : error.message }, { status: 400 });

  await supabase.auth.signOut();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(recoveryCookie, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}

function hasRecoveryCookieFor(request: Request, userId: string) {
  const expected = `${recoveryCookie}=${userId}`;
  return request.headers.get("cookie")?.split(";").some((part) => part.trim() === expected) === true;
}
