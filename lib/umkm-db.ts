import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicUmkm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  profileImage?: string;
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

function readContact(value: unknown, address?: string | null): PublicUmkm["contact"] {
  const contact = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    whatsapp: undefined,
    instagram: typeof contact.instagram === "string" ? contact.instagram : undefined,
    address: address?.trim() || undefined,
  };
}

function readProfileImage(value: unknown) {
  const contact = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return typeof contact.profileImage === "string" && (contact.profileImage.startsWith("data:image/") || /^\/umkm-profiles\/[a-zA-Z0-9._-]+$/.test(contact.profileImage)) ? contact.profileImage : undefined;
}

const readPublishedUmkm = unstable_cache(async () => {
  const rows = await prisma.umkm.findMany({
    where: { isPublished: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: {
            where: {
              publishStatus: "published",
              images: { some: { imageUrl: { not: "" } } },
            },
          },
        },
      },
      products: {
        where: { publishStatus: "published", images: { some: { imageUrl: { not: "" } } } },
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
    profileImage: readProfileImage(umkm.publicContact),
    ownerName: umkm.ownerName || "",
    businessType: umkm.businessType || "",
    permits: { nib: umkm.nib || "", halal: umkm.halalPermit || "", sppirt: umkm.sppirt || "" },
    contact: readContact(umkm.publicContact, umkm.privateAddress),
    productCount: umkm._count.products,
    products: umkm.products.map((product) => ({ id: product.id, name: product.name, slug: product.slug, productType: product.productType, category: product.category.name, imageUrl: product.images[0]?.imageUrl })),
  } satisfies PublicUmkm));
}, ["public-umkm"], { revalidate: 30, tags: ["public-umkm"] });

export async function getPublicUmkm() {
  if (!process.env.DATABASE_URL) return [];
  try { return await readPublishedUmkm(); } catch { return []; }
}

export async function getPublicUmkmBySlug(slug: string) {
  const umkm = await getPublicUmkm();
  return umkm.find((item) => item.slug === slug) || null;
}
