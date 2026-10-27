import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const ADMIN_AUTH_COOKIE = "sb-admin-auth-token";

export function getAdminAuthConfig() {
  const hasDedicatedConfig = Boolean(
    process.env.ADMIN_SUPABASE_URL ||
    process.env.ADMIN_SUPABASE_PUBLISHABLE_KEY ||
    process.env.ADMIN_SUPABASE_ANON_KEY,
  );
  const url = hasDedicatedConfig ? process.env.ADMIN_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = hasDedicatedConfig
    ? process.env.ADMIN_SUPABASE_PUBLISHABLE_KEY || process.env.ADMIN_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url: url || "", key: key || "", isDedicated: hasDedicatedConfig };
}

export function createAdminAuthServerClient() {
  const { url, key } = getAdminAuthConfig();
  if (!url) throw new Error("ADMIN_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is missing.");
  if (!key) throw new Error("ADMIN_SUPABASE_PUBLISHABLE_KEY/ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/ANON_KEY is missing.");
  const cookieStore = cookies();

  return createServerClient(url, key, {
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
