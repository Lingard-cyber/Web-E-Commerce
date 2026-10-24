import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const ADMIN_AUTH_COOKIE = "sb-admin-auth-token";

function getPublicKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  return key;
}

export function createAdminAuthServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  const cookieStore = cookies();

  return createServerClient(url, getPublicKey(), {
    cookieOptions: { name: ADMIN_AUTH_COOKIE },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies; the route/middleware handles persistence.
        }
      },
    },
  });
}
