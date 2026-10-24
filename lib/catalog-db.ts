import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { catalogEntries, categories, type CatalogEntry, type ProductType } from "@/lib/catalog";

export type CatalogCategory = {
  slug: string;
  name: string;
  count: number;
  description: string;
};

const fallbackCategories: CatalogCategory[] = categories.map((category) => ({ ...category }));

const readPublishedCatalog = unstable_cache(
  async () => {
    const [products, categoryRows] = await Promise.all([
      prisma.product.findMany({
        where: { publishStatus: "published" },
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        include: {
          category: true,
          umkm: true,
          variants: { where: { isActive: true }, orderBy: { priceIdr: "asc" } },
          images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        },
      }),
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: { where: { publishStatus: "published" } } } } },
      }),
    ]);

    const entries: CatalogEntry[] = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category.name,
      categorySlug: product.category.slug,
      productType: product.productType as ProductType,
      description: product.description || "Produk lokal dari pelaku usaha Kepuharjo.",
      producer: product.umkm?.name,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        label: variant.label,
        priceIdr: variant.priceIdr,
        stockQty: variant.stockQty,
        active: variant.isActive,
      })),
      sourcePdfPage: product.sourcePdfPage || 0,
      sourceCatalogEntry: product.sourceCatalogEntry || 0,
      status: product.publishStatus as CatalogEntry["status"],
      verificationNote: product.verificationNote || undefined,
      imageAlt: product.images[0]?.altText || product.name,
      imageSrc: product.images[0]?.imageUrl,
      images: product.images.map((image) => ({ id: image.id, imageUrl: image.imageUrl, altText: image.altText || product.name })),
    }));

    const publicCategories: CatalogCategory[] = categoryRows.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category._count.products,
      description: category.description || "Produk pilihan dari pelaku usaha lokal.",
    }));

    return { entries, categories: publicCategories };
  },
  ["public-catalog"],
  { revalidate: 30 },
);

export async function getPublicCatalog() {
  if (!process.env.DATABASE_URL) return { entries: catalogEntries, categories: fallbackCategories };

  try {
    const result = await readPublishedCatalog();
    // Keep the storefront useful before the first seed/publication, while all
    // published database records are present this path is fully database-backed.
    return result.entries.length > 0 ? result : { entries: catalogEntries, categories: fallbackCategories };
  } catch {
    return { entries: catalogEntries, categories: fallbackCategories };
  }
}

export async function getPublicProduct(slug: string) {
  const catalog = await getPublicCatalog();
  return catalog.entries.find((entry) => entry.slug === slug);
}
