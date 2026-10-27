require("dotenv").config({ override: true });
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

function adminEmails() {
  return Array.from(new Set([
    process.env.ADMIN_LOGIN_EMAIL,
    ...(process.env.ADMIN_EMAILS || "").split(/[;,\s]+/),
  ].map((email) => String(email || "").trim().toLowerCase()).filter(Boolean)));
}

function sqlValue(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

const emails = adminEmails();
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!emails.length) throw new Error("ADMIN_LOGIN_EMAIL atau ADMIN_EMAILS belum diisi.");
if (!databaseUrl) throw new Error("DIRECT_URL atau DATABASE_URL belum diisi.");

const rows = emails.map((email) => {
  const id = `admin-${crypto.createHash("sha256").update(email).digest("hex").slice(0, 24)}`;
  return `(${sqlValue(id)}, ${sqlValue(email)}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
}).join(",\n");
const sql = `INSERT INTO "admin_users" ("id", "email", "isActive", "createdAt", "updatedAt") VALUES ${rows} ON CONFLICT ("email") DO UPDATE SET "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP;`;
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "db", "execute", "--stdin", "--url", databaseUrl], { input: sql, encoding: "utf8", stdio: ["pipe", "inherit", "inherit"] });
if (result.status !== 0) process.exit(result.status || 1);
console.log(`Admin aktif: ${emails.join(", ")}`);
