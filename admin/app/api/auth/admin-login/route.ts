import fs from "node:fs";
import path from "node:path";
import * as nextEnv from "@next/env";
import { NextResponse } from "next/server";
import { createAdminAuthServerClient } from "../../../../../lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

const envDir = fs.existsSync(path.join(process.cwd(), ".env")) ? process.cwd() : path.resolve(process.cwd(), "..");
nextEnv.loadEnvConfig(envDir, process.env.NODE_ENV !== "production", undefined, true);

const runtimeEnv = (key: string) => process.env[key] || "";

function adminEmail() {
  return runtimeEnv("ADMIN_LOGIN_EMAIL") || "la.rayan0203@gmai.com";
}

export async function POST(request: Request) {
  const email = adminEmail();
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email) return NextResponse.json({ error: "Email admin belum dikonfigurasi di server." }, { status: 500 });
  if (password.length < 8) return NextResponse.json({ error: "Password admin minimal 8 karakter." }, { status: 400 });

  const url = runtimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = runtimeEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || runtimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) return NextResponse.json({ error: "Konfigurasi Supabase belum lengkap di server." }, { status: 500 });

  const supabase = createAdminAuthServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: "Password admin tidak sesuai atau akun belum aktif." }, { status: 401 });

  return NextResponse.json({ ok: true });
}
