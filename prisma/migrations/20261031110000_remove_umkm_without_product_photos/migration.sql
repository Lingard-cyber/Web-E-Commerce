DELETE FROM "umkm" AS umkm_row
WHERE NOT EXISTS (
  SELECT 1
  FROM "produk" AS product_row
  INNER JOIN "gambar_produk" AS image_row
    ON image_row."productId" = product_row."id"
  WHERE product_row."umkmId" = umkm_row."id"
    AND NULLIF(BTRIM(image_row."imageUrl"), '') IS NOT NULL
);
