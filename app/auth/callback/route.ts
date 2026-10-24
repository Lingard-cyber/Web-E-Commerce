import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUser } from "@/lib/auth-profile";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/akun/login?callback_error=1", url.origin));

    const { data: { user } } = await supabase.auth.getUser();
    if (user && process.env.DATABASE_URL) {
      try {
        await syncAuthUser(user);
      } catch {
        // Auth callback must still complete when the optional profile database is unavailable.
      }
    }
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
