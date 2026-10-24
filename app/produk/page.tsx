import { ProductBrowser } from "@/components/product-browser";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicCatalog } from "@/lib/catalog-db";

export const revalidate = 30;

export default async function ProdukPage() {
  const { entries, categories } = await getPublicCatalog();
  const products = entries.filter((entry) => entry.productType !== "service");
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Produk unggulan Kepuharjo" title="Belanja produk lokal dengan alur yang jelas." description={`${products.length} produk dari katalog publik. Produk yang sudah diverifikasi dapat dilanjutkan melalui keranjang, checkout, pembayaran, dan pengiriman atau pengambilan.`} /><ProductBrowser mode="product" entries={entries} categoryOptions={categories} /></main></SiteShell>;
}
