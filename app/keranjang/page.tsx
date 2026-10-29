import { PageHeading } from "@/components/page-heading";
import { SiteShell } from "@/components/site-shell";
import { CartPage } from "@/components/cart-page";
export default function CartRoute() { return <SiteShell><main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Keranjang belanja" title="Simpan pilihan produk Anda." description="Periksa pilihan produk, ubah jumlah, atau hapus item kapan saja, lalu lanjutkan ke pembayaran." /><CartPage /></main></SiteShell>; }
