import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export async function requireAdminApi() {
  const admin = await getAdminContext();
  if (!admin) return { admin: null, response: NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 }) };
  return { admin, response: null };
}

export function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function textValue(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function slugValue(value: unknown) {
  return textValue(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
