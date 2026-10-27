import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-session";

export type AdminContext = {
  authUser?: never;
  email: string;
  name: string;
  databaseUserId?: string;
};

export async function getAdminContext(): Promise<AdminContext | null> {
  if (!hasAdminSession()) return null;

  let adminName = process.env.ADMIN_LOGIN_NAME || "Admin Forkom";
  let databaseUser: { id: string; role: "customer" | "admin" } | null = null;
  if (process.env.DATABASE_URL) {
    try {
      const databaseAdmin = await prisma.adminUser.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { email: true } });
      if (databaseAdmin?.email && !process.env.ADMIN_LOGIN_NAME) adminName = databaseAdmin.email.split("@")[0];
      databaseUser = await prisma.user.findUnique({
        where: { email: databaseAdmin?.email || "" },
        select: { id: true, role: true },
      });
    } catch {
      databaseUser = null;
    }
  }

  return {
    email: "",
    name: adminName,
    databaseUserId: databaseUser?.role === "admin" ? databaseUser.id : undefined,
  };
}

export async function requireAdmin() {
  const context = await getAdminContext();
  if (!context) redirect(process.env.ADMIN_LOGIN_URL || process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || "/admin/login");
  return context;
}
