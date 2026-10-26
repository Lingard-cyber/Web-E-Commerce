import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
};

export async function syncAuthUser(user: AuthUser) {
  if (!process.env.DATABASE_URL) return;

  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name.trim() : null;
  const phone = (typeof user.phone === "string" ? user.phone : typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "").trim() || null;
  const contactEmail = (typeof user.email === "string" ? user.email : typeof user.user_metadata?.contactEmail === "string" ? user.user_metadata.contactEmail : "").trim().toLowerCase() || null;
  if (!contactEmail && !phone) return;
  const existingByAuthId = await prisma.user.findUnique({ where: { authId: user.id }, select: { id: true } });

  if (existingByAuthId) {
    await prisma.user.update({ where: { id: existingByAuthId.id }, data: { ...(contactEmail ? { email: contactEmail } : {}), name, phone } });
    return;
  }

  const existingByEmail = contactEmail ? await prisma.user.findUnique({ where: { email: contactEmail }, select: { id: true } }) : null;
  if (existingByEmail) {
    await prisma.user.update({ where: { id: existingByEmail.id }, data: { authId: user.id, name, phone } });
    return;
  }

  const existingByPhone = phone ? await prisma.user.findFirst({ where: { phone }, select: { id: true } }) : null;
  if (existingByPhone) {
    await prisma.user.update({ where: { id: existingByPhone.id }, data: { authId: user.id, ...(contactEmail ? { email: contactEmail } : {}), name } });
    return;
  }

  if (contactEmail) await prisma.user.create({ data: { authId: user.id, email: contactEmail, name, phone } });
}
