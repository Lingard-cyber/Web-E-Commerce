import { ProductBrowser } from "@/components/product-browser";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicCatalog } from "@/lib/catalog-db";

export const revalidate = 30;

export default async function ProdukPage() {
  const { entries, categories } = await getPublicCatalog();
  const products = entries.filter((entry) => entry.productType !== "service");
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Produk Forkom UMKM Kepuharjo" title="Pilih produk lokal dari katalog." description={`${products.length} produk lokal dari katalog dan foto tambahan. Pilih varian, masukkan ke keranjang, lalu lanjutkan ke pembayaran.`} /><ProductBrowser mode="product" entries={entries} categoryOptions={categories} /></main></SiteShell>;
}
