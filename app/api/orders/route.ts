import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.DATABASE_URL || !process.env.XENDIT_SECRET_KEY) return NextResponse.json({ error: "Checkout belum dikonfigurasi. DATABASE_URL dan XENDIT_SECRET_KEY diperlukan." }, { status: 503 });
  return NextResponse.json({ error: "Implementasi order creation belum diaktifkan. Validasi akun, harga, stok, ongkir, dan idempotency key wajib dilakukan di server." }, { status: 501 });
}
