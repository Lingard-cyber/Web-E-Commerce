import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUser } from "@/lib/auth-profile";

export async function POST() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true, skipped: true });

  const { data: { user }, error } = await createClient().auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Sesi login tidak ditemukan." }, { status: 401 });

  await syncAuthUser(user);
  return NextResponse.json({ ok: true });
}
