import { NextResponse } from "next/server";
import { isAdminPasswordConfigured, matchesAdminPassword, setAdminSession } from "../../../../../lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length < 8) return NextResponse.json({ error: "Password admin minimal 8 karakter." }, { status: 400 });
  if (!isAdminPasswordConfigured()) return NextResponse.json({ error: "ADMIN_LOGIN_PASSWORD belum dikonfigurasi di server." }, { status: 500 });
  if (!matchesAdminPassword(password)) return NextResponse.json({ error: "Password admin tidak sesuai." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  setAdminSession(response);
  return response;
}
