import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // DATABASE_URL points to Supabase's transaction-mode pooler (6543), which
    // drops interactive Prisma transactions. Use the session/direct connection
    // for the long-lived Next.js server when it is configured.
    datasources: {
      db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
