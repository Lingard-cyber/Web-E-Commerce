CREATE TYPE "CategoryStatus" AS ENUM ('coming_soon', 'published');

ALTER TABLE "kategori" ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'published';
