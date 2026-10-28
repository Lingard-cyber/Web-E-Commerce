import { AdminCategoryManager } from "@/components/admin-category-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const admin = await requireAdmin();
  const categories = process.env.DATABASE_URL ? await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  }).catch(() => []) : [];
  const items = categories.map(({ id, name, slug, description, sortOrder, status, _count }) => ({ id, name, slug, description, sortOrder, status, productCount: _count.products }));
  return <AdminShell name={admin.name} email={admin.email}>
    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">Katalog</p>
    <h1 className="mt-2 font-display text-3xl font-bold">Kategori</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted">Tambah kategori untuk mengelompokkan produk dan jasa. Kategori baru dapat dipilih saat menambah atau mengedit entri katalog.</p>
    <AdminCategoryManager initialCategories={items} />
  </AdminShell>;
}
