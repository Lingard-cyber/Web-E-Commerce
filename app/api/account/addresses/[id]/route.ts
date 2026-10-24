import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDatabaseUser } from "@/lib/account-server";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const user = await getCurrentDatabaseUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const address = await prisma.address.findFirst({ where: { id: params.id, userId: user.id }, select: { id: true } });
  if (!address) return NextResponse.json({ error: "Alamat tidak ditemukan." }, { status: 404 });
  await prisma.address.delete({ where: { id: address.id } });
  return NextResponse.json({ ok: true });
}
