import Link from "next/link";
import { CheckCircle2, Clock3, Package, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = process.env.DATABASE_URL ? await prisma.order.findUnique({ where: { publicCode: params.id }, select: { publicCode: true, status: true, totalIdr: true, createdAt: true, payment: { select: { status: true, checkoutUrl: true } }, shipment: { select: { status: true, courier: true, trackingNumber: true } } } }).catch(() => null) : null;
  if (!order) notFound();
  const status = order.status === "completed" || order.status === "shipped" ? "Pesanan sedang dipenuhi" : order.status === "paid" || order.status === "processing" ? "Pembayaran diterima" : order.status === "cancelled" || order.status === "expired" ? "Pesanan tidak dilanjutkan" : "Menunggu pembayaran";
  return <SiteShell><main className="mx-auto max-w-[760px] px-4 py-10 sm:px-6 sm:py-14"><div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-card sm:p-10"><p className="text-[10px] font-bold uppercase tracking-widest text-forest-700">Pesanan {order.publicCode}</p><div className="mt-5 flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-green-50 text-forest-800"><CheckCircle2 size={23} /></span><div><h1 className="font-display text-3xl font-bold">{status}</h1><p className="mt-2 text-xs leading-5 text-muted">Informasi pesanan Anda akan diperbarui seiring pembayaran dan proses pemenuhan berlangsung.</p></div></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><StatusCard icon={<Clock3 size={16} />} label="Pesanan" value={label(order.status)} /><StatusCard icon={<Package size={16} />} label="Pembayaran" value={label(order.payment?.status || "pending")} /><StatusCard icon={<Truck size={16} />} label="Pengiriman" value={label(order.shipment?.status || "pending")} /></div>{order.shipment?.trackingNumber && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-xs">{order.shipment.courier || "Kurir"} · Nomor resi: <strong>{order.shipment.trackingNumber}</strong></p>}{order.payment?.status === "pending" && (order.payment.checkoutUrl ? <a href={order.payment.checkoutUrl} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-800 px-5 text-[10px] font-bold text-white">Lanjutkan pembayaran</a> : <Link href={`/bayar/${order.publicCode}`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-800 px-5 text-[10px] font-bold text-white">Lanjutkan pembayaran</Link>)}<Link href="/belanja" className="mt-6 block text-center text-[10px] font-bold text-forest-800 hover:underline">Kembali ke katalog</Link></div></main></SiteShell>;
}

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function StatusCard({ icon, label: title, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-[#f5f8f4] p-4"><span className="flex items-center gap-2 text-[10px] font-bold text-forest-800">{icon}{title}</span><strong className="mt-3 block text-xs">{value}</strong></div>; }
