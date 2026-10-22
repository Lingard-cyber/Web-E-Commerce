import { ProductBrowser } from "@/components/product-browser";
import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { catalogEntries } from "@/lib/catalog";

export default function BelanjaPage() {
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Belanja di etalase Kepuharjo" title="Temukan produk lokal yang punya cerita." description={`${catalogEntries.length} entri dari katalog awal Forkom UMKM Kepuharjo. Data ditampilkan sebagai draft sampai harga, stok, foto, dan izin tayang dikonfirmasi admin.`} /><ProductBrowser /></main></SiteShell>;
}
