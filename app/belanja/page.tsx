import { ProductBrowser } from "@/components/product-browser";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicCatalog } from "@/lib/catalog-db";

export const revalidate = 30;

export default async function BelanjaPage() {
  const { entries, categories } = await getPublicCatalog();
  const products = entries.filter((entry) => entry.productType !== "service");
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Belanja di etalase Kepuharjo" title="Temukan produk lokal yang punya cerita." description={`${products.length} produk dari katalog publik Forkom UMKM Kepuharjo. Jasa tersedia di halaman terpisah agar alur pemesanan lebih jelas.`} /><ProductBrowser mode="product" entries={entries} categoryOptions={categories} /></main></SiteShell>;
}
