import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production" && request.nextUrl.pathname.startsWith("/admin")) {
    const adminUrl = process.env.ADMIN_APP_URL || "http://localhost:3001";
    const destination = new URL(request.nextUrl.pathname.replace(/^\/admin/, "") || "/", adminUrl);
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination);
  }

  let response = NextResponse.next({ request });
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
