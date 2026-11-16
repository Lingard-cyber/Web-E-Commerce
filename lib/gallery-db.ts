import { prisma } from "@/lib/prisma";

export type GalleryImageRecord = {
  id: string;
  src: string;
  alt: string;
  title: string;
  isPublished: boolean;
  isHero: boolean;
  sortOrder: number;
};

function toRecord(item: { id: string; src: string; alt: string; title: string; isPublished: boolean; isHero: boolean; sortOrder: number }): GalleryImageRecord {
  return {
    id: item.id,
    src: item.src,
    alt: item.alt,
    title: item.title,
    isPublished: item.isPublished,
    isHero: item.isHero,
    sortOrder: item.sortOrder,
  };
}

export async function getPublicGallery(): Promise<GalleryImageRecord[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const items = await prisma.galleryImage.findMany({
      where: { isPublished: true, NOT: { src: { startsWith: "/catalog/" } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return items.map(toRecord);
  } catch {
    return [];
  }
}

export async function getAdminGallery(): Promise<GalleryImageRecord[]> {
  if (!process.env.DATABASE_URL) return [];
  const items = await prisma.galleryImage.findMany({
    where: { NOT: { src: { startsWith: "/catalog/" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return items.map(toRecord);
}
