import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = await requireAdmin();
  const [products, categories, umkm] = process.env.DATABASE_URL ? await Promise.all([
    prisma.product.findMany({ where: { productType: { not: "service" }, publishStatus: { not: "archived" } }, orderBy: { updatedAt: "desc" }, include: { variants: { where: { isActive: true }, take: 1 }, images: { where: { isPrimary: true }, take: 1 } } }).catch(() => []),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }).catch(() => []),
    prisma.umkm.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }).catch(() => []),
  ]) : [[], [], []];
  const items = products.map((product) => ({ id: product.id, name: product.name, slug: product.slug, description: product.description, categoryId: product.categoryId, umkmId: product.umkmId, publishStatus: product.publishStatus, serviceBookingMode: product.serviceBookingMode, serviceRequirements: product.serviceRequirements, serviceAvailability: product.serviceAvailability, serviceDuration: product.serviceDuration, imageUrl: product.images[0]?.imageUrl || "", variantLabel: product.variants[0]?.label || "", priceIdr: product.variants[0]?.priceIdr ?? null, stockQty: product.variants[0]?.stockQty ?? null }));
  return <AdminShell name={admin.name} email={admin.email}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Katalog</p><h1 className="mt-2 font-display text-3xl font-bold">Manajemen Produk</h1><p className="mt-2 max-w-2xl text-sm text-muted">Buat, ubah, publikasikan, dan nonaktifkan produk fisik tanpa menghapus histori transaksi.</p><AdminProductManager mode="product" categories={categories} umkm={umkm} initialItems={items} /></AdminShell>;
}
