import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAuthUser } from "@/lib/auth-profile";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function value(input: unknown, maxLength: number) {
  return typeof input === "string" ? input.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = value(body?.name, 120);
  const email = value(body?.email, 160).toLowerCase();
  const phone = value(body?.phone, 40);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name) return NextResponse.json({ error: "Nama lengkap wajib diisi." }, { status: 400 });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Format email belum valid." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, phone } });
    if (error) return authError(error.message);
    await syncCreatedUser(data.user);
    return NextResponse.json({ ok: true, requiresEmailConfirmation: false }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registrasi belum dapat diproses.";
    if (!message.includes("Supabase server credentials are missing")) return NextResponse.json({ error: "Registrasi belum dapat diproses. Silakan coba lagi." }, { status: 500 });

    // The public Supabase key is sufficient for normal sign-up. The service
    // role key is only needed to confirm the email automatically on the server.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !publicKey) return NextResponse.json({ error: "Layanan autentikasi belum dikonfigurasi di server." }, { status: 503 });

    const supabase = createSupabaseClient(url, publicKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } });
    if (signUpError) return authError(signUpError.message);
    await syncCreatedUser(data.user);
    return NextResponse.json({ ok: true, requiresEmailConfirmation: !data.session }, { status: 201 });
  }
}

function authError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already") || normalized.includes("registered") || normalized.includes("user exists")) return NextResponse.json({ error: "Email tersebut sudah terdaftar. Silakan masuk." }, { status: 409 });
  return NextResponse.json({ error: message }, { status: 400 });
}

async function syncCreatedUser(user: Parameters<typeof syncAuthUser>[0] | null) {
  if (!user) return;
  try {
    await syncAuthUser(user);
  } catch {
    // Profil akan disinkronkan kembali saat pengguna berhasil login.
  }
}
