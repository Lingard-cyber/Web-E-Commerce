import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-session";

export type AdminContext = {
  authUser?: never;
  email: string;
  name: string;
};

export async function getAdminContext(): Promise<AdminContext | null> {
  if (!hasAdminSession()) return null;

  return {
    email: process.env.ADMIN_LOGIN_EMAIL || "",
    name: process.env.ADMIN_LOGIN_NAME || "Admin Forkom",
  };
}

export async function requireAdmin() {
  const context = await getAdminContext();
  if (!context) redirect(process.env.ADMIN_LOGIN_URL || process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || "/admin/login");
  return context;
}
