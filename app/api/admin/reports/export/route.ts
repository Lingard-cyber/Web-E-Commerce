import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function csvCell(value: string | number | null | undefined) {
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });

  try {
    const [orders, inquiries] = await Promise.all([
      prisma.order.findMany({
        where: { payment: { status: "paid" }, status: { notIn: ["cancelled", "expired"] } },
        orderBy: { createdAt: "desc" },
        include: { items: true, user: { select: { name: true, email: true, phone: true } } },
      }),
      prisma.serviceInquiry.findMany({
        where: { status: "completed" },
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true } } },
      }),
    ]);

    const rows: Array<Array<string | number | null | undefined>> = [
      ["Jenis", "Tanggal", "Kode pesanan / ID", "Status", "Produk / Jasa", "Varian", "Jumlah", "Harga satuan (Rp)", "Subtotal (Rp)", "Nama pelanggan", "Kontak"],
    ];
    for (const order of orders) for (const item of order.items) rows.push([
      "Produk", order.createdAt.toISOString(), order.publicCode, order.status, item.productName,
      item.variantLabel, item.quantity, item.unitPriceIdr, item.subtotalIdr,
      order.user.name || "", order.user.phone || order.user.email,
    ]);
    for (const inquiry of inquiries) rows.push([
      "Jasa", inquiry.createdAt.toISOString(), inquiry.id, inquiry.status, inquiry.product.name,
      "", "", "", "", inquiry.name, inquiry.contact,
    ]);

    const content = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
    const date = new Date().toISOString().slice(0, 10);
    return new Response(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-forkom-${date}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Laporan belum dapat diunduh." }, { status: 500 });
  }
}
