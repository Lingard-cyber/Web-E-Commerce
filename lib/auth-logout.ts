import { createClient } from "@/lib/supabase/client";

/**
 * Ends the Supabase session everywhere and removes only authentication
 * storage keys. Customer cart/local preferences are intentionally preserved.
 */
export async function breakAuthSession(redirectTo: string) {
  const { error } = await createClient().auth.signOut({ scope: "local" });

  if (typeof window !== "undefined") {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      for (const key of Object.keys(storage)) {
        if (/auth-token|supabase/i.test(key)) storage.removeItem(key);
      }
    }

    // A full navigation clears client memory and prevents the old page from
    // remaining interactive after logout.
    window.location.replace(redirectTo);
  }

  return error;
}
