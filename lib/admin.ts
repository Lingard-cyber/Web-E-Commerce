import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createAdminAuthServerClient } from "@/lib/supabase/admin-auth";

export type AdminContext = {
  authUser: SupabaseUser;
  email: string;
  name: string;
  databaseUserId?: string;
};

function configuredAdminEmails() {
  return Array.from(new Set([
    process.env.ADMIN_LOGIN_EMAIL || "la.rayan0203@gmail.com",
    ...(process.env.ADMIN_EMAILS || "").split(/[;,\s]+/),
  ].map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = createAdminAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  let databaseUser: { id: string; role: "customer" | "admin" } | null = null;
  if (process.env.DATABASE_URL) {
    try {
      databaseUser = await prisma.user.findUnique({
        where: { authId: user.id },
        select: { id: true, role: true },
      });
    } catch {
      // The page renders a configuration warning when the database is unavailable.
    }
  }

  const email = user.email.toLowerCase();
  const isAdmin = configuredAdminEmails().includes(email);
  if (!isAdmin) return null;

  return {
    authUser: user,
    email,
    name: String(user.user_metadata?.name || user.email.split("@")[0]),
    databaseUserId: databaseUser?.id,
  };
}

export async function requireAdmin() {
  const context = await getAdminContext();
  if (!context) redirect(process.env.ADMIN_LOGIN_URL || process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || "/admin/login");
  return context;
}
