import { AdminUmkmManager } from "@/components/admin-umkm-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUmkmPage() {
  const admin = await requireAdmin();
  const umkm = process.env.DATABASE_URL ? await prisma.umkm.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }).catch(() => []) : [];
  const items = umkm.map((item) => { const contact = item.publicContact && typeof item.publicContact === "object" && !Array.isArray(item.publicContact) ? item.publicContact as { instagram?: string } : {}; return { id: item.id, name: item.name, description: item.description, isPublished: item.isPublished, ownerName: item.ownerName || "", businessType: item.businessType || "", nib: item.nib || "", halalPermit: item.halalPermit || "", sppirt: item.sppirt || "", ktp: item.privateKtp || "", address: item.privateAddress || "", instagram: contact.instagram || "", productCount: item._count.products }; });
  return <AdminShell name={admin.name} email={admin.email}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Data pelaku usaha</p><h1 className="mt-2 font-display text-3xl font-bold">Data UMKM</h1><p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">Data UMKM dikelola terpusat oleh Admin Forkom. Pemilik UMKM tidak memiliki akun atau dashboard terpisah.</p><AdminUmkmManager initialItems={items} /></AdminShell>;
}
