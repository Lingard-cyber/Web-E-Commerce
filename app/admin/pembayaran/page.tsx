import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { formatAdminDate, formatAdminRupiah, labelStatus } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const admin = await requireAdmin();
  const payments = process.env.DATABASE_URL ? await prisma.payment.findMany({ orderBy: { updatedAt: "desc" }, include: { order: { select: { publicCode: true, totalIdr: true, user: { select: { name: true, email: true } } } } } }).catch(() => []) : [];
  return <AdminShell name={admin.name} email={admin.email}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Keuangan</p><h1 className="mt-2 font-display text-3xl font-bold">Pembayaran</h1><p className="mt-2 max-w-2xl text-sm text-muted">Status pembayaran hanya dianggap valid dari data Payment dan webhook provider di backend, bukan dari redirect browser.</p><div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-muted"><tr><th className="px-5 py-3">Pesanan</th><th className="px-5 py-3">Pembeli</th><th className="px-5 py-3">Provider</th><th className="px-5 py-3">Nilai</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Diperbarui</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-muted">Belum ada catatan pembayaran.</td></tr> : payments.map((payment) => <tr key={payment.id}><td className="px-5 py-4 font-bold text-forest-800">{payment.order.publicCode}</td><td className="px-5 py-4">{payment.order.user.name || payment.order.user.email}</td><td className="px-5 py-4">{payment.provider}</td><td className="px-5 py-4">{formatAdminRupiah(payment.order.totalIdr)}</td><td className="px-5 py-4"><span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-bold text-forest-800">{labelStatus(payment.status)}</span></td><td className="px-5 py-4 text-muted">{formatAdminDate(payment.updatedAt)}</td></tr>)}</tbody></table></div></div></AdminShell>;
}
