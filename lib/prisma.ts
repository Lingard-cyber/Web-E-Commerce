import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const datasourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const logs = process.env.NODE_ENV === "development" ? ["error", "warn"] as const : ["error"] as const;

function createPrismaClient() {
  if (!datasourceUrl) return new PrismaClient({ log: [...logs] });

  // pg-connection-string lets the URL's sslmode override supplied TLS settings,
  // so remove it and configure the Supabase CA explicitly with hostname checks on.
  const connectionUrl = new URL(datasourceUrl);
  connectionUrl.searchParams.delete("sslmode");
  const caPath = process.env.SUPABASE_DB_CA_CERT || join(process.cwd(), "certificates", "supabase-prod-ca-2021.crt");
  const adapter = new PrismaPg({
    connectionString: connectionUrl.toString(),
    ssl: { ca: readFileSync(caPath, "utf8"), rejectUnauthorized: true },
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 300_000,
    // Supabase's session pooler caps the project's concurrent sessions; each
    // local storefront/admin server should use only a small share of that cap.
    max: 2,
  });

  return new PrismaClient({ adapter, log: [...logs] });
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
