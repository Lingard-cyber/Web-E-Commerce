import { prisma } from "@/lib/prisma";
import { galleryImages } from "@/lib/gallery";

export type GalleryImageRecord = {
  id: string;
  src: string;
  alt: string;
  title: string;
  isPublished: boolean;
  isHero: boolean;
  sortOrder: number;
};

const fallbackGallery: GalleryImageRecord[] = galleryImages.map((image, index) => ({
  id: `static-gallery-${index + 1}`,
  src: image.src,
  alt: image.alt,
  title: image.title,
  isPublished: true,
  isHero: true,
  sortOrder: index + 1,
}));

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
  if (!process.env.DATABASE_URL) return fallbackGallery.filter((image) => image.isPublished);
  try {
    const items = await prisma.galleryImage.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
    return items.length ? items.map(toRecord) : fallbackGallery.filter((image) => image.isPublished);
  } catch {
    return fallbackGallery.filter((image) => image.isPublished);
  }
}

export async function getAdminGallery(): Promise<GalleryImageRecord[]> {
  if (!process.env.DATABASE_URL) return fallbackGallery;
  try {
    const items = await prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
    return items.length ? items.map(toRecord) : fallbackGallery;
  } catch {
    return fallbackGallery;
  }
}
