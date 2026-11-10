import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, textValue, validationError } from "@/lib/admin-api";

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return validationError("Data laporan tidak valid.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return validationError("Data laporan tidak valid.");
  const body = parsed as Record<string, unknown>;

  const type = body.type;
  const category = textValue(body.category, 60);
  const description = textValue(body.description, 240);
  const amountIdr = Number(body.amountIdr);
  const date = textValue(body.date, 10);
  const paymentMethod = body.paymentMethod;
  const evidenceUrl = textValue(body.evidenceUrl, 1000);
  const umkmId = textValue(body.umkmId, 100);
  const transactionDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00.000+07:00`) : null;

  if (type !== "income") return validationError("Laporan ini hanya menerima catatan penjualan.");
  if (!category || !description) return validationError("Kategori dan keterangan wajib diisi.");
  if (!Number.isSafeInteger(amountIdr) || amountIdr <= 0) return validationError("Nominal harus berupa angka positif.");
  if (paymentMethod !== "cash" && paymentMethod !== "bank_transfer" && paymentMethod !== "qris" && paymentMethod !== "marketplace" && paymentMethod !== "other") return validationError("Metode pembayaran wajib dipilih.");
  if (evidenceUrl) {
    try {
      const url = new URL(evidenceUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") return validationError("Tautan bukti harus menggunakan HTTP atau HTTPS.");
    } catch { return validationError("Tautan bukti transaksi tidak valid."); }
  }
  if (!transactionDate || Number.isNaN(transactionDate.getTime()) || transactionDate.toISOString().slice(0, 10) !== date) {
    return validationError("Tanggal transaksi tidak valid.");
  }
  if (umkmId && !(await prisma.umkm.findUnique({ where: { id: umkmId }, select: { id: true } }))) return validationError("Data UMKM tidak ditemukan.");

  const entry = await prisma.financialEntry.create({
    data: { type, category, description, amountIdr, transactionDate, paymentMethod, evidenceUrl: evidenceUrl || null, umkmId: umkmId || null },
    select: { id: true },
  });
  return NextResponse.json({ id: entry.id }, { status: 201 });
}
