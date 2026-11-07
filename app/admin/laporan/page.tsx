import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { formatAdminRupiah } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const admin = await requireAdmin();
  let report: Awaited<ReturnType<typeof loadReport>> | null = null;
  let error = "";
  if (!process.env.DATABASE_URL) error = "Database belum dikonfigurasi. Laporan tidak dapat ditampilkan.";
  else {
    try { report = await loadReport(); }
    catch { error = "Laporan gagal dimuat karena database tidak dapat diakses. Coba muat ulang beberapa saat lagi."; }
  }
  return <AdminShell name={admin.name} email={admin.email}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Analitik operasional</p><div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-3xl font-bold">Laporan Penjualan</h1><p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">Ringkasan awal memisahkan penjualan produk yang pembayarannya tervalidasi dari permintaan jasa. Nilai jasa tidak dihitung sebelum ada transaksi pembayaran nyata.</p></div>{!error && <a href="/api/admin/reports/export" download className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-700"><Download size={16} />Unduh laporan CSV</a>}</div>{error ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">{error}</div> : report && <><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ReportCard label="Penjualan produk tervalidasi" value={formatAdminRupiah(report.productSales._sum.subtotalIdr || 0)} /><ReportCard label="Baris item terjual" value={report.productSales._count._all} /><ReportCard label="Pesanan berhasil" value={report.successfulOrders} /><ReportCard label="Pesanan dibatalkan" value={report.cancelledOrders} /></div><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-bold">Aktivitas jasa selesai</h2><p className="mt-2 text-base leading-7 text-slate-700">{report.serviceCount} inquiry jasa berstatus selesai. Omzet jasa belum dihitung karena schema saat ini menyimpan inquiry, bukan invoice/Payment jasa.</p></section></>}</AdminShell>;
}

async function loadReport() {
  const [productSales, serviceCount, successfulOrders, cancelledOrders] = await Promise.all([
    prisma.orderItem.aggregate({ where: { order: { status: { notIn: ["cancelled", "expired"] }, payment: { status: "paid" } } }, _sum: { subtotalIdr: true }, _count: { _all: true } }),
    prisma.serviceInquiry.count({ where: { status: "completed" } }),
    prisma.order.count({ where: { payment: { status: "paid" }, status: { notIn: ["cancelled", "expired"] } } }),
    prisma.order.count({ where: { status: "cancelled" } }),
  ]);
  return { productSales, serviceCount, successfulOrders, cancelledOrders };
}

function ReportCard({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs text-muted">{label}</p><strong className="mt-3 block font-display text-2xl">{value}</strong></div>; }
