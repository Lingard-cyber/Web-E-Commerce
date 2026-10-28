-- Temporary catalog prices keep products purchasable until producers confirm
-- the final price. Service variants remain quotation-based.
UPDATE "varian_produk" AS variant
SET "priceIdr" = CASE
  WHEN variant."label" ILIKE '%ulang tahun%' THEN 100000
  WHEN variant."label" ILIKE '%kemasan%' THEN 25000
  ELSE 15000
END
FROM "produk" AS product
WHERE variant."productId" = product."id"
  AND variant."priceIdr" IS NULL
  AND product."productType" <> 'service'::"ProductType";
