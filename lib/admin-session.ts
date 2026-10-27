import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "kepuharjo-admin-session";
const SESSION_MAX_AGE = 60 * 60 * 12;

function loadAdminEnvironment() {
  const roots = [process.cwd(), path.resolve(process.cwd(), "..")];
  for (const root of roots) {
    for (const fileName of [".env", ".env.local", ".env.deploy"]) {
      const filePath = path.join(root, fileName);
      if (!fs.existsSync(filePath)) continue;
      for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*(ADMIN_LOGIN_PASSWORD|ADMIN_PASSWORD|ADMIN_LOGIN_NAME)\s*=\s*(.*?)\s*$/);
        if (!match || process.env[match[1]]) continue;
        process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
      }
    }
  }
}

loadAdminEnvironment();

function configuredPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
}

function sessionSignature(timestamp: string) {
  return crypto.createHmac("sha256", configuredPassword()).update(`admin-session:${timestamp}`).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAdminPasswordConfigured() {
  return configuredPassword().length >= 8;
}

export function matchesAdminPassword(password: string) {
  const expected = configuredPassword();
  return expected.length >= 8 && safeEqual(password, expected);
}

export function setAdminSession(response: NextResponse) {
  const timestamp = String(Date.now());
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: `${timestamp}.${sessionSignature(timestamp)}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: "", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export function hasAdminSession() {
  if (!isAdminPasswordConfigured()) return false;
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  const [timestamp, signature] = token.split(".");
  const time = Number(timestamp);
  if (!timestamp || !signature || !Number.isFinite(time)) return false;
  if (Date.now() - time > SESSION_MAX_AGE * 1000 || time > Date.now() + 60_000) return false;
  return safeEqual(signature, sessionSignature(timestamp));
}
