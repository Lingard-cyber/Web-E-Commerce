import { NextResponse } from "next/server";
import { createAdminAuthServerClient } from "../../../../../lib/supabase/admin-auth";

export async function POST() {
  const { error } = await createAdminAuthServerClient().auth.signOut({ scope: "local" });
  if (error) return NextResponse.json({ error: "Sesi admin belum dapat diputus." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
