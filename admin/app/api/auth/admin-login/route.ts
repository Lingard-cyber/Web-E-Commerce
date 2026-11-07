import { NextResponse } from "next/server";
import { isAdminPasswordConfigured, matchesAdminPassword, setAdminSession } from "../../../../../lib/admin-session";

export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const attempts = new Map<string, { failures: number; windowStartedAt: number; lockedUntil: number }>();

function clientKey(request: Request) {
  const forwardedValues = request.headers.get("x-forwarded-for")?.split(",").map((value) => value.trim()).filter(Boolean);
  return forwardedValues?.at(-1) || request.headers.get("x-real-ip") || "unknown";
}

function pruneAttempts(now: number) {
  for (const [key, attempt] of attempts) {
    if (attempt.lockedUntil <= now && now - attempt.windowStartedAt >= WINDOW_MS) attempts.delete(key);
  }
  if (attempts.size >= 10000) attempts.delete(attempts.keys().next().value!);
}

export async function POST(request: Request) {
  const now = Date.now();
  pruneAttempts(now);
  const key = clientKey(request);
  let attempt = attempts.get(key);
  if (attempt && attempt.lockedUntil > now) {
    return NextResponse.json({ error: "Terlalu banyak percobaan login. Coba lagi setelah beberapa menit." }, { status: 429, headers: { "Retry-After": String(Math.ceil((attempt.lockedUntil - now) / 1000)) } });
  }
  if (!attempt || now - attempt.windowStartedAt >= WINDOW_MS || attempt.lockedUntil <= now) {
    attempt = { failures: 0, windowStartedAt: now, lockedUntil: 0 };
    attempts.set(key, attempt);
  }
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length < 8) return NextResponse.json({ error: "Password admin minimal 8 karakter." }, { status: 400 });
  if (!isAdminPasswordConfigured()) return NextResponse.json({ error: "ADMIN_LOGIN_PASSWORD belum dikonfigurasi di server." }, { status: 500 });
  if (!matchesAdminPassword(password)) {
    attempt.failures++;
    if (attempt.failures >= MAX_FAILURES) attempt.lockedUntil = now + LOCKOUT_MS;
    attempts.set(key, attempt);
    return NextResponse.json({ error: attempt.lockedUntil ? "Terlalu banyak percobaan login. Coba lagi setelah beberapa menit." : "Password admin tidak sesuai." }, { status: attempt.lockedUntil ? 429 : 401, headers: attempt.lockedUntil ? { "Retry-After": String(Math.ceil(LOCKOUT_MS / 1000)) } : undefined });
  }
  attempts.delete(key);
  const response = NextResponse.json({ ok: true });
  setAdminSession(response);
  return response;
}
