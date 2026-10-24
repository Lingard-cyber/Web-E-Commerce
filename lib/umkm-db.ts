import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicUmkm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  contact: {
    whatsapp?: string;
    instagram?: string;
    address?: string;
  };
  productCount: number;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    productType: string;
    category: string;
    imageUrl?: string;
  }>;
};

const fallbackUmkm: PublicUmkm[] = [
  { id: "dummy-umkm-egi-ds", name: "EGI DS", slug: "egi-ds", description: "Produsen keripik rumahan dengan bahan pilihan dari sekitar Kepuharjo.", contact: { whatsapp: "081234567890", instagram: "@egids.kepuharjo", address: "Kepuharjo, Cangkringan" }, productCount: 4, products: [{ id: "dummy-product-egi-jamur", name: "Keripik Jamur EGI DS", slug: "keripik-jamur-egi-ds", productType: "ready_stock", category: "Makanan & Camilan", imageUrl: "/catalog/egi-ds/keripik-jamur.jpeg" }, { id: "dummy-product-manggleng", name: "Manggleng Pedas Manis", slug: "manggleng-pedas-manis", productType: "ready_stock", category: "Makanan & Camilan", imageUrl: "/catalog/egi-ds/manggleng.jpeg" }] },
  { id: "dummy-umkm-griya-snack", name: "Griya Snack", slug: "griya-snack", description: "Aneka kue kering dan camilan untuk keluarga maupun acara.", contact: { whatsapp: "081298765432", instagram: "@griyasnack", address: "Kepuharjo, Cangkringan" }, productCount: 2, products: [{ id: "dummy-product-cookies", name: "Cookies Griya Snack", slug: "cookies-griya-snack", productType: "ready_stock", category: "Makanan & Camilan", imageUrl: "/catalog/griya-snack/mixed-cookies.jpeg" }, { id: "dummy-product-nastar", name: "Nastar Griya Snack", slug: "nastar-griya-snack", productType: "ready_stock", category: "Oleh-oleh Kepuharjo", imageUrl: "/catalog/griya-snack/nastar.jpeg" }] },
  { id: "dummy-umkm-masruroh", name: "Rumah Jahit Masruroh", slug: "rumah-jahit-masruroh", description: "Jasa jahit dan permak pakaian untuk kebutuhan harian dan acara.", contact: { whatsapp: "081212121212", instagram: "@rumahjahit.masruroh", address: "Kepuharjo, Cangkringan" }, productCount: 1, products: [{ id: "dummy-product-jahit", name: "Jasa Jahit Masruroh", slug: "jasa-jahit-masruroh", productType: "service", category: "Fashion & Jasa Jahit", imageUrl: "/placeholder-product.svg" }] },
  { id: "dummy-umkm-arga", name: "Arga Cookies", slug: "arga-cookies", description: "Kue kering rumahan dengan pilihan rasa untuk hantaran dan acara.", contact: { whatsapp: "081223344556", instagram: "@argacookies", address: "Pakem, Sleman" }, productCount: 2, products: [{ id: "dummy-product-kastengel", name: "Kastengel Arga Cookies", slug: "kastengel-arga", productType: "ready_stock", category: "Oleh-oleh Kepuharjo", imageUrl: "/catalog/arga/kastengel.jpeg" }, { id: "dummy-product-almond", name: "Almond Cookies Arga", slug: "almond-cookies-arga", productType: "ready_stock", category: "Makanan & Camilan", imageUrl: "/catalog/arga/almond-cookies.jpeg" }] },
  { id: "dummy-umkm-alif", name: "Camilan Alif", slug: "camilan-alif", description: "Camilan sehat berbahan kelor dan hasil kebun lokal.", contact: { whatsapp: "081277788899", instagram: "@camilanalif", address: "Kepuharjo, Cangkringan" }, productCount: 1, products: [{ id: "dummy-product-stik-kelor", name: "Stik Kelor Camilan Alif", slug: "stik-kelor-camilan-alif", productType: "ready_stock", category: "Makanan & Camilan", imageUrl: "/catalog/camilan-alif/stik-kelor.jpeg" }] },
];

function readContact(value: unknown): PublicUmkm["contact"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const contact = value as Record<string, unknown>;
  return {
    whatsapp: typeof contact.whatsapp === "string" ? contact.whatsapp : typeof contact.contact === "string" ? contact.contact : undefined,
    instagram: typeof contact.instagram === "string" ? contact.instagram : undefined,
    address: typeof contact.address === "string" ? contact.address : undefined,
  };
}

const readPublishedUmkm = unstable_cache(
  async () => {
    const rows = await prisma.umkm.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: { where: { publishStatus: "published" } } } },
        products: {
          where: { publishStatus: "published" },
          orderBy: { name: "asc" },
          take: 8,
          include: {
            category: true,
            images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
          },
        },
      },
    });

    return rows.map((umkm) => ({
      id: umkm.id,
      name: umkm.name,
      slug: umkm.slug,
      description: umkm.description || "Pelaku usaha lokal dari Kepuharjo.",
      contact: readContact(umkm.publicContact),
      productCount: umkm._count.products,
      products: umkm.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        productType: product.productType,
        category: product.category.name,
        imageUrl: product.images[0]?.imageUrl,
      })),
    } satisfies PublicUmkm));
  },
  ["public-umkm"],
  { revalidate: 30 },
);

export async function getPublicUmkm() {
  if (!process.env.DATABASE_URL) return fallbackUmkm;
  try {
    const result = await readPublishedUmkm();
    return result.length > 0 ? result : fallbackUmkm;
  } catch {
    return fallbackUmkm;
  }
}

export async function getPublicUmkmBySlug(slug: string) {
  const umkm = await getPublicUmkm();
  return umkm.find((item) => item.slug === slug) || null;
}
