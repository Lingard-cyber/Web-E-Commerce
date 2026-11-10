import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function csvCell(value: string | number | null | undefined) {
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

function validDate(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

export async function GET(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const { searchParams } = new URL(request.url);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const start = validDate(startParam) ? startParam : `${today.slice(0, 7)}-01`;
  const requestedEnd = validDate(endParam) ? endParam : today;
  const end = requestedEnd >= start ? requestedEnd : start;
  const requestedUmkmId = searchParams.get("umkmId") || undefined;
  const from = new Date(`${start}T00:00:00.000+07:00`);
  const until = new Date(`${end}T00:00:00.000+07:00`);
  until.setUTCDate(until.getUTCDate() + 1);

  try {
    const [umkms, orders, entries] = await Promise.all([
      prisma.umkm.findMany({ select: { id: true, name: true } }),
      prisma.order.findMany({
        where: { payment: { status: "paid", paidAt: { gte: from, lt: until } }, status: { notIn: ["cancelled", "expired"] } },
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: { select: { umkmId: true } } } }, payment: { select: { paidAt: true } } },
      }),
      prisma.financialEntry.findMany({
        where: { type: "income", transactionDate: { gte: from, lt: until } },
        include: { umkm: { select: { name: true } } }, orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      }),
    ]);
    const umkmId = requestedUmkmId && umkms.some((item) => item.id === requestedUmkmId) ? requestedUmkmId : undefined;
    const selectedEntries = umkmId ? entries.filter((entry) => entry.umkmId === umkmId) : entries;
    const nameById = new Map(umkms.map((item) => [item.id, item.name]));
    const rows: Array<Array<string | number | null | undefined>> = [
      ["Tanggal", "Jenis", "UMKM", "Referensi", "Kategori", "Keterangan", "Metode pembayaran", "Bukti transaksi", "Nominal (Rp)"],
    ];
    for (const order of orders) {
      const grouped = new Map<string, { amount: number; items: string[] }>();
      for (const item of order.items) {
        const key = item.product.umkmId || "";
        const group = grouped.get(key) || { amount: 0, items: [] };
        group.amount += item.subtotalIdr;
        group.items.push(`${item.productName} (${item.quantity})`);
        grouped.set(key, group);
      }
      const groups = [...grouped.entries()];
      let discountRemaining = order.discountIdr;
      groups.forEach(([id, group], index) => {
        const discount = index === groups.length - 1 ? discountRemaining : Math.min(discountRemaining, Math.round(order.discountIdr * group.amount / Math.max(order.subtotalIdr, 1)));
        discountRemaining -= discount;
        if (umkmId && id !== umkmId) return;
        rows.push([
          order.payment?.paidAt?.toISOString() || "", "Penjualan produk", nameById.get(id) || "Penjualan umum Forkom", order.publicCode,
          "Penjualan produk setelah diskon", group.items.join("; "), "Gateway pembayaran situs", "", Math.max(0, group.amount - discount),
        ]);
      });
    }
    for (const entry of selectedEntries) rows.push([
      entry.transactionDate.toISOString(), "Penjualan jasa/lainnya",
      entry.umkm?.name || "Penjualan umum Forkom", entry.id, entry.category, entry.description,
      methodLabel(entry.paymentMethod), entry.evidenceUrl || "", entry.amountIdr,
    ]);

    const content = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
    const suffix = umkmId ? `-${umkmId}` : "";
    return new Response(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-penjualan-${start}-${end}${suffix}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Laporan belum dapat diunduh." }, { status: 500 });
  }
}

function methodLabel(method: string | null) {
  return ({ cash: "Tunai", bank_transfer: "Transfer bank", qris: "QRIS", marketplace: "Marketplace", other: "Lainnya" } as Record<string, string>)[method || ""] || "-";
}
