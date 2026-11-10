import { AdminFinancialEntryForm } from "@/components/admin-financial-entry-form";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { formatAdminRupiah } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = { start?: string; end?: string; umkmId?: string };

export default async function AdminReportsPage({ searchParams }: { searchParams?: SearchParams }) {
  const admin = await requireAdmin();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
  const monthStart = `${today.slice(0, 7)}-01`;
  const start = validDate(searchParams?.start) ? searchParams.start! : monthStart;
  const requestedEnd = validDate(searchParams?.end) ? searchParams!.end! : today;
  const end = requestedEnd >= start ? requestedEnd : start;
  let report: Awaited<ReturnType<typeof loadReport>> | null = null;
  let error = "";
  if (!process.env.DATABASE_URL) error = "Database belum dikonfigurasi. Laporan tidak dapat ditampilkan.";
  else {
    try { report = await loadReport(start, end, searchParams?.umkmId); }
    catch { error = "Laporan gagal dimuat karena database tidak dapat diakses. Coba muat ulang beberapa saat lagi."; }
  }
  const selectedName = report?.selectedUmkm?.name || "Semua UMKM";
  const query = `start=${start}&end=${end}${report?.selectedUmkm ? `&umkmId=${report.selectedUmkm.id}` : ""}`;
  const totals = report?.totals;
  return <AdminShell name={admin.name} email={admin.email}>
    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Penjualan</p>
    <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display text-3xl font-bold">Laporan Penjualan</h1><p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">Pantau penjualan produk dan jasa menurut periode atau UMKM.</p></div>
      {!error && <a href={`/api/admin/reports/export?${query}`} download className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-700"><Download size={16} />Unduh CSV</a>}
    </div>

    <form method="get" className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-xs font-semibold text-slate-700">Dari tanggal<input name="start" type="date" required defaultValue={start} className="mt-1 block h-10 rounded-lg border border-slate-200 px-3" /></label>
      <label className="text-xs font-semibold text-slate-700">Sampai tanggal<input name="end" type="date" required defaultValue={end} className="mt-1 block h-10 rounded-lg border border-slate-200 px-3" /></label>
      <label className="text-xs font-semibold text-slate-700">UMKM
        <select name="umkmId" defaultValue={report?.selectedUmkm?.id || ""} className="mt-1 block h-10 min-w-52 rounded-lg border border-slate-200 bg-white px-3">
          <option value="">Semua UMKM</option>{report?.umkms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <button className="h-10 rounded-lg bg-slate-100 px-4 text-xs font-bold text-slate-800">Tampilkan</button>
      <span className="text-xs text-muted">{start} sampai {end} - {selectedName}</span>
    </form>

    {error ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">{error}</div> : report && totals && <>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard label="Penjualan produk" value={formatAdminRupiah(totals.productSales)} />
        <ReportCard label="Penjualan jasa/lainnya" value={formatAdminRupiah(totals.serviceSales)} />
        <ReportCard label="Total penjualan" value={formatAdminRupiah(totals.totalSales)} emphasize />
        <ReportCard label="Pesanan produk dibayar" value={totals.orderCount} />
      </div>
      <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Pesanan produk berbayar tercatat otomatis. Catat pembayaran jasa atau penjualan di luar checkout setelah diterima. Pilih “Semua UMKM” untuk melihat transaksi umum Forkom.</p>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold">Catat penjualan jasa/lainnya</h2>
        <p className="mt-1 text-xs leading-5 text-muted">Gunakan untuk pembayaran yang sudah diterima dan belum tercatat sebagai pesanan produk di situs.</p>
        <AdminFinancialEntryForm today={today} umkm={report.umkms} />
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold">Penjualan per UMKM</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-muted"><tr><th className="pb-3">UMKM</th><th className="pb-3 text-right">Produk</th><th className="pb-3 text-right">Jasa/lainnya</th><th className="pb-3 text-right">Total penjualan</th><th className="pb-3 text-right">Pesanan produk dibayar</th></tr></thead><tbody className="divide-y divide-slate-100">{report.rows.map((row) => <tr key={row.id || "general"}><td className="py-3 font-semibold">{row.name}</td><td className="py-3 text-right">{formatAdminRupiah(row.productSales)}</td><td className="py-3 text-right">{formatAdminRupiah(row.serviceSales)}</td><td className="py-3 text-right font-bold">{formatAdminRupiah(row.totalSales)}</td><td className="py-3 text-right">{row.orderCount}</td></tr>)}</tbody></table></div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div><h2 className="font-display text-xl font-bold">Rincian penjualan jasa/lainnya</h2><p className="mt-1 text-xs text-muted">{report.entries.length} catatan pada periode ini</p></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-muted"><tr><th className="pb-3">Tanggal</th><th className="pb-3">UMKM</th><th className="pb-3">Kategori</th><th className="pb-3">Keterangan</th><th className="pb-3">Pembayaran</th><th className="pb-3">Bukti</th><th className="pb-3 text-right">Nominal</th></tr></thead><tbody className="divide-y divide-slate-100">{report.entries.length === 0 ? <tr><td colSpan={7} className="py-8 text-center text-muted">Belum ada penjualan jasa/lainnya yang dicatat pada periode ini.</td></tr> : report.entries.map((entry) => <tr key={entry.id}><td className="py-3">{formatJakartaDate(entry.transactionDate)}</td><td className="py-3">{entry.umkm?.name || "Operasional Forkom / umum"}</td><td className="py-3">{entry.category}</td><td className="py-3">{entry.description}</td><td className="py-3">{methodLabel(entry.paymentMethod)}</td><td className="py-3">{entry.evidenceUrl ? <a href={entry.evidenceUrl} target="_blank" rel="noreferrer" className="font-semibold text-forest-800 underline">Lihat bukti</a> : "-"}</td><td className="py-3 text-right font-bold text-forest-800">{formatAdminRupiah(entry.amountIdr)}</td></tr>)}</tbody></table></div>
      </section>
    </>}
  </AdminShell>;
}

async function loadReport(start: string, end: string, requestedUmkmId?: string) {
  const from = new Date(`${start}T00:00:00.000+07:00`);
  const until = new Date(`${end}T00:00:00.000+07:00`);
  until.setUTCDate(until.getUTCDate() + 1);
  const [umkms, paidOrders, entries] = await Promise.all([
    prisma.umkm.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.order.findMany({
      where: { status: { notIn: ["cancelled", "expired"] }, payment: { status: "paid", paidAt: { gte: from, lt: until } } },
      select: { id: true, subtotalIdr: true, discountIdr: true, items: { select: { subtotalIdr: true, product: { select: { umkmId: true } } } } },
    }),
    prisma.financialEntry.findMany({ where: { type: "income", transactionDate: { gte: from, lt: until } }, include: { umkm: { select: { id: true, name: true } } }, orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }] }),
  ]);
  const selectedUmkm = requestedUmkmId ? umkms.find((item) => item.id === requestedUmkmId) || null : null;
  const selectedId = selectedUmkm?.id;
  const rowsById = new Map<string, { id: string | null; name: string; productSales: number; serviceSales: number; totalSales: number; orderCount: number }>();
  rowsById.set("", { id: null, name: "Penjualan umum Forkom", productSales: 0, serviceSales: 0, totalSales: 0, orderCount: 0 });
  for (const umkm of umkms) rowsById.set(umkm.id, { id: umkm.id, name: umkm.name, productSales: 0, serviceSales: 0, totalSales: 0, orderCount: 0 });

  for (const order of paidOrders) {
    const grouped = new Map<string, number>();
    for (const item of order.items) {
      const key = item.product.umkmId || "";
      grouped.set(key, (grouped.get(key) || 0) + item.subtotalIdr);
    }
    const groups = [...grouped.entries()];
    let discountRemaining = order.discountIdr;
    groups.forEach(([key, gross], index) => {
      const allocatedDiscount = index === groups.length - 1 ? discountRemaining : Math.min(discountRemaining, Math.round(order.discountIdr * gross / Math.max(order.subtotalIdr, 1)));
      discountRemaining -= allocatedDiscount;
      const row = rowsById.get(key)!;
      row.productSales += Math.max(0, gross - allocatedDiscount);
      row.orderCount += 1;
    });
  }
  for (const entry of entries) (rowsById.get(entry.umkmId || "") || rowsById.get("")!).serviceSales += entry.amountIdr;

  const allRows = [...rowsById.values()];
  for (const row of allRows) row.totalSales = row.productSales + row.serviceSales;
  const rows = selectedId ? allRows.filter((row) => row.id === selectedId) : allRows;
  const selectedEntries = selectedId ? entries.filter((entry) => entry.umkmId === selectedId) : entries;
  const totals = rows.reduce((sum, row) => ({
    productSales: sum.productSales + row.productSales,
    serviceSales: sum.serviceSales + row.serviceSales,
    totalSales: sum.totalSales + row.totalSales,
    orderCount: sum.orderCount + row.orderCount,
  }), { productSales: 0, serviceSales: 0, totalSales: 0, orderCount: 0 });
  if (!selectedId) totals.orderCount = paidOrders.length;
  return { umkms, selectedUmkm, entries: selectedEntries, rows, totals };
}

function validDate(value?: string): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function methodLabel(method: string | null) {
  return ({ cash: "Tunai", bank_transfer: "Transfer bank", qris: "QRIS", marketplace: "Marketplace", other: "Lainnya" } as Record<string, string>)[method || ""] || "-";
}

function formatJakartaDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(value);
}

function ReportCard({ label, value, emphasize = false }: { label: string; value: string | number; emphasize?: boolean }) {
  return <div className={`rounded-2xl border p-5 shadow-sm ${emphasize ? "border-forest-200 bg-forest-50" : "border-slate-200 bg-white"}`}><p className="text-xs text-muted">{label}</p><strong className="mt-3 block font-display text-2xl">{value}</strong></div>;
}
