import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  const received = request.headers.get("x-callback-token");
  if (!expected || !received || received !== expected) return NextResponse.json({ error: "Webhook tidak terautentikasi." }, { status: 401 });
  await request.text();
  return NextResponse.json({ error: "Webhook handler belum dihubungkan ke payment_events dan order state machine." }, { status: 501 });
}
