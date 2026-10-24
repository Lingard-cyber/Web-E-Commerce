import { prisma } from "@/lib/prisma";
import { syncAuthUser } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentDatabaseUser() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user?.email) return null;
  await syncAuthUser(user);
  return prisma.user.findUnique({ where: { authId: user.id }, select: { id: true, email: true, name: true, phone: true } });
}
