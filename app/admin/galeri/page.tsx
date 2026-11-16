import { AdminGalleryManager } from "@/components/admin-gallery-manager";
import { AdminShell } from "@/components/admin-shell";
import { getAdminGallery } from "@/lib/gallery-db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const admin = await requireAdmin();
  const items = await getAdminGallery();
  return <AdminShell name={admin.name} email={admin.email}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Konten storefront</p><h1 className="mt-2 font-display text-3xl font-bold">Galeri Kepuharjo</h1><p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">Kelola dokumentasi kegiatan, pertemuan, dan kebersamaan warga Kepuharjo untuk beranda serta halaman galeri publik. Foto khusus produk atau jasa dikelola pada katalog masing-masing.</p><AdminGalleryManager initialItems={items} /></AdminShell>;
}
