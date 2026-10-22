import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { CartPage } from "@/components/cart-page";
export default function CartRoute() { return <SiteShell><main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Keranjang belanja" title="Siapkan pesanan Anda." description="Keranjang tersimpan di perangkat ini. Saat produksi, data pesanan akan disimpan ke database setelah akun dan checkout aktif." /><CartPage /></main></SiteShell>; }
