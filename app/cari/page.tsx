import { ProductBrowser } from "@/components/product-browser";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { getPublicCatalog } from "@/lib/catalog-db";

export const revalidate = 30;

type SearchPageProps = {
  searchParams: { q?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const { entries, categories } = await getPublicCatalog();

  return (
    <SiteShell>
      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14">
        <PageHeading
          eyebrow="Pencarian katalog Kepuharjo"
          title={query ? `Hasil untuk “${query}”` : "Cari produk dan layanan lokal."}
          description={query ? "Telusuri produk dan layanan yang sesuai. Gunakan filter untuk mempersempit hasil." : "Masukkan kata kunci untuk menemukan produk, varian, kategori, atau UMKM."}
        />
        <ProductBrowser initialSearch={query} entries={entries} categoryOptions={categories} />
      </main>
    </SiteShell>
  );
}
