import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { catalogEntries } from "@/lib/catalog";

export type PublicUmkm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerName: string;
  businessType: string;
  permits: { nib: string; halal: string; sppirt: string };
  contact: { whatsapp?: string; instagram?: string; address?: string };
  productCount: number;
  products: Array<{ id: string; name: string; slug: string; productType: string; category: string; imageUrl?: string }>;
};

export function formatUmkmDescription(name: string, description: string | null | undefined, productCount = 0) {
  void name;
  void productCount;
  return description?.trim() || "";
}

const fallbackUmkm: PublicUmkm[] = Array.from(new Set(catalogEntries.map((entry) => entry.producer).filter((value): value is string => Boolean(value)))).map((name) => {
  const products = catalogEntries.filter((entry) => entry.producer === name);
  return {
    id: `catalog-umkm-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: formatUmkmDescription(name, null, products.length),
    ownerName: "",
    businessType: "",
    permits: { nib: "", halal: "", sppirt: "" },
    contact: {},
    productCount: products.length,
    products: products.map((entry) => ({ id: entry.id, name: entry.name, slug: entry.slug, productType: entry.productType, category: entry.category, imageUrl: entry.imageSrc })),
  };
});

function readContact(value: unknown): PublicUmkm["contact"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const contact = value as Record<string, unknown>;
  return {
    whatsapp: undefined,
    instagram: typeof contact.instagram === "string" ? contact.instagram : undefined,
    address: undefined,
  };
}

const readPublishedUmkm = unstable_cache(async () => {
  const rows = await prisma.umkm.findMany({
    where: { isPublished: true },
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
    ownerName: umkm.ownerName || "",
    businessType: umkm.businessType || "",
    permits: { nib: umkm.nib || "", halal: umkm.halalPermit || "", sppirt: umkm.sppirt || "" },
    contact: readContact(umkm.publicContact),
    productCount: umkm._count.products,
    products: umkm.products.map((product) => ({ id: product.id, name: product.name, slug: product.slug, productType: product.productType, category: product.category.name, imageUrl: product.images[0]?.imageUrl })),
  } satisfies PublicUmkm));
}, ["public-umkm"], { revalidate: 30, tags: ["public-umkm"] });

export async function getPublicUmkm() {
  if (!process.env.DATABASE_URL) return fallbackUmkm;
  try { return await readPublishedUmkm(); } catch { return fallbackUmkm; }
}

export async function getPublicUmkmBySlug(slug: string) {
  const umkm = await getPublicUmkm();
  return umkm.find((item) => item.slug === slug) || null;
}
