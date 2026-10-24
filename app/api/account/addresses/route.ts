import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDatabaseUser } from "@/lib/account-server";

type AddressPayload = { label?: string; recipientName?: string; phone?: string; address?: string; village?: string; district?: string; regency?: string; postalCode?: string; isDefault?: boolean };

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const user = await getCurrentDatabaseUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  const body = await request.json().catch(() => null) as AddressPayload | null;
  const label = body?.label?.trim().slice(0, 60) || "Rumah";
  const recipientName = body?.recipientName?.trim().slice(0, 120);
  const phone = body?.phone?.trim().slice(0, 40);
  const address = body?.address?.trim().slice(0, 1000);
  if (!recipientName || !phone || !address) return NextResponse.json({ error: "Nama penerima, nomor telepon, dan alamat wajib diisi." }, { status: 400 });
  const created = await prisma.$transaction(async (tx) => {
    if (body?.isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    return tx.address.create({ data: { userId: user.id, label, recipientName, phone, address, village: body?.village?.trim().slice(0, 120) || null, district: body?.district?.trim().slice(0, 120) || null, regency: body?.regency?.trim().slice(0, 120) || null, postalCode: body?.postalCode?.trim().slice(0, 20) || null, isDefault: Boolean(body?.isDefault) } });
  });
  return NextResponse.json({ address: created }, { status: 201 });
}
