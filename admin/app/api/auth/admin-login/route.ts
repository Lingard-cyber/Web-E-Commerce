import fs from "node:fs";
import path from "node:path";
import * as nextEnv from "@next/env";
import { NextResponse } from "next/server";
import { getAuthErrorMessage } from "../../../../../lib/auth-errors";
import { createAdminAuthServerClient } from "../../../../../lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

const envDir = fs.existsSync(path.join(process.cwd(), ".env")) ? process.cwd() : path.resolve(process.cwd(), "..");
nextEnv.loadEnvConfig(envDir, process.env.NODE_ENV !== "production", undefined, true);

const runtimeEnv = (key: string) => process.env[key] || "";

function adminEmails() {
  return Array.from(new Set([
    runtimeEnv("ADMIN_LOGIN_EMAIL"),
    ...runtimeEnv("ADMIN_EMAILS").split(/[;,\s]+/),
  ].map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const allowedEmails = adminEmails();

  if (!allowedEmails.length) return NextResponse.json({ error: "Email admin belum dikonfigurasi di server." }, { status: 500 });
  if (!email || !allowedEmails.includes(email)) return NextResponse.json({ error: "Email atau kata sandi tidak sesuai." }, { status: 401 });
  if (password.length < 8) return NextResponse.json({ error: "Password admin minimal 8 karakter." }, { status: 400 });

  const url = runtimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = runtimeEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || runtimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) return NextResponse.json({ error: "Konfigurasi Supabase belum lengkap di server." }, { status: 500 });

  try {
    const supabase = createAdminAuthServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn("Admin login gagal:", error.message);
      return NextResponse.json({ error: getAuthErrorMessage(error.message) }, { status: 401 });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Layanan autentikasi sedang tidak tersedia. Periksa konfigurasi Supabase." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
