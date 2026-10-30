ALTER TABLE "umkm"
  ADD COLUMN "importKey" TEXT,
  ADD COLUMN "ownerName" TEXT,
  ADD COLUMN "businessType" TEXT,
  ADD COLUMN "nib" TEXT,
  ADD COLUMN "halalPermit" TEXT,
  ADD COLUMN "sppirt" TEXT,
  ADD COLUMN "privateKtp" TEXT,
  ADD COLUMN "privateAddress" TEXT,
  ADD COLUMN "privatePhone" TEXT;

ALTER TABLE "produk" ADD COLUMN "importKey" TEXT;

CREATE UNIQUE INDEX "umkm_importKey_key" ON "umkm"("importKey");
CREATE UNIQUE INDEX "produk_importKey_key" ON "produk"("importKey");

UPDATE "umkm"
SET "privatePhone" = NULLIF("publicContact"->>'contact', ''),
    "privateAddress" = NULLIF("publicContact"->>'address', ''),
    "publicContact" = CASE
      WHEN NULLIF("publicContact"->>'instagram', '') IS NULL THEN NULL
      ELSE jsonb_build_object('instagram', "publicContact"->>'instagram')
    END
WHERE "publicContact" IS NOT NULL;
