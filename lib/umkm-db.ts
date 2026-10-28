import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { catalogEntries } from "@/lib/catalog";

export type PublicUmkm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  contact: { whatsapp?: string; instagram?: string; address?: string };
  productCount: number;
  products: Array<{ id: string; name: string; slug: string; productType: string; category: string; imageUrl?: string }>;
};

export function formatUmkmDescription(name: string, description: string | null | undefined, productCount = 0) {
  const clean = description?.trim() || "Pelaku usaha lokal yang menghadirkan produk dan layanan untuk masyarakat Kepuharjo.";
  if (clean.toLowerCase().includes(name.trim().toLowerCase())) return clean;
  const offer = productCount > 0 ? "melayani pilihan produk atau jasa yang dapat dilihat pada etalase usaha" : "sedang menyiapkan produk dan layanan untuk ditampilkan";
  return `${name} merupakan salah satu UMKM lokal Kepuharjo yang ${offer}. ${clean}`;
}

const fallbackUmkm: PublicUmkm[] = Array.from(new Set(catalogEntries.map((entry) => entry.producer).filter((value): value is string => Boolean(value)))).map((name) => {
  const products = catalogEntries.filter((entry) => entry.producer === name);
  return {
    id: `catalog-umkm-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: formatUmkmDescription(name, null, products.length),
    contact: {},
    productCount: products.length,
    products: products.map((entry) => ({ id: entry.id, name: entry.name, slug: entry.slug, productType: entry.productType, category: entry.category, imageUrl: entry.imageSrc })),
  };
});

function readContact(value: unknown): PublicUmkm["contact"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const contact = value as Record<string, unknown>;
  return {
    whatsapp: typeof contact.whatsapp === "string" ? contact.whatsapp : typeof contact.contact === "string" ? contact.contact : undefined,
    instagram: typeof contact.instagram === "string" ? contact.instagram : undefined,
    address: typeof contact.address === "string" ? contact.address : undefined,
  };
}

const readPublishedUmkm = unstable_cache(async () => {
  const rows = await prisma.umkm.findMany({
    where: { isPublished: true, products: { some: { publishStatus: "published", sourceCatalogEntry: { not: null } } } },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { publishStatus: "published" } } } },
      products: {
        where: { publishStatus: "published" },
        orderBy: { name: "asc" },
        take: 8,
        include: { category: true, images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 } },
      },
    },
  });
  return rows.map((umkm) => ({
    id: umkm.id,
    name: umkm.name,
    slug: umkm.slug,
    description: formatUmkmDescription(umkm.name, umkm.description, umkm._count.products),
    contact: readContact(umkm.publicContact),
    productCount: umkm._count.products,
    products: umkm.products.map((product) => ({ id: product.id, name: product.name, slug: product.slug, productType: product.productType, category: product.category.name, imageUrl: product.images[0]?.imageUrl })),
  } satisfies PublicUmkm));
}, ["public-umkm"], { revalidate: 30 });

export async function getPublicUmkm() {
  if (!process.env.DATABASE_URL) return fallbackUmkm;
  try { return await readPublishedUmkm(); } catch { return fallbackUmkm; }
}

export async function getPublicUmkmBySlug(slug: string) {
  const umkm = await getPublicUmkm();
  return umkm.find((item) => item.slug === slug) || null;
}
