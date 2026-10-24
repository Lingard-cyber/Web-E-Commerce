import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export async function syncAuthUser(user: AuthUser) {
  if (!process.env.DATABASE_URL || !user.email) return;

  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name.trim() : null;
  const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone.trim() : null;
  const existingByAuthId = await prisma.user.findUnique({ where: { authId: user.id }, select: { id: true } });

  if (existingByAuthId) {
    await prisma.user.update({ where: { id: existingByAuthId.id }, data: { email: user.email, name, phone } });
    return;
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } });
  if (existingByEmail) {
    await prisma.user.update({ where: { id: existingByEmail.id }, data: { authId: user.id, name, phone } });
    return;
  }

  await prisma.user.create({ data: { authId: user.id, email: user.email, name, phone } });
}
