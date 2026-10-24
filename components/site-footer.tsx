import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-forest-950 text-white">
      <div className="border-b border-white/10 px-6 py-3 text-center text-[9px] font-bold tracking-[.12em] text-white/70 sm:text-[10px]">
        DUKUNG UMKM LOKAL · PRODUK KEPUHARJO, PASAR LEBIH LUAS
      </div>
      <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 md:grid-cols-[1.4fr_.8fr_.9fr] md:gap-16">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-white/80 bg-white"><img src="/forkom-umkm-kepuharjo.jpg" alt="Logo FORKOM UMKM KEPUHARJO" className="h-full w-full object-cover" /></span>
            <span className="text-[10px] font-bold">FORKOM UMKM KEPUHARJO</span>
          </div>
          <p className="max-w-xs text-[10px] leading-5 text-white/55">Etalase digital produk lokal dan jasa UMKM Kalurahan Kepuharjo, Cangkringan, Sleman, DIY.</p>
        </div>
        <div>
          <h3 className="mb-3 text-[9px] font-bold uppercase tracking-wider text-accent">Belanja</h3>
          <div className="grid gap-2 text-[10px] text-white/55"><Link href="/belanja">Katalog produk</Link><Link href="/jasa">Jasa & layanan</Link><Link href="/kategori">Kategori</Link><Link href="/keranjang">Keranjang belanja</Link><Link href="/lacak-pesanan">Lacak pesanan</Link></div>
        </div>
        <div>
          <h3 className="mb-3 text-[9px] font-bold uppercase tracking-wider text-accent">Bantuan &amp; legal</h3>
          <div className="grid gap-2 text-[10px] text-white/55"><Link href="/bantuan">Pusat bantuan</Link><Link href="/kontak">Kontak</Link><Link href="/kebijakan-privasi">Kebijakan privasi</Link><Link href="/syarat-ketentuan">Syarat &amp; ketentuan</Link><Link href="/kebijakan-pengiriman">Kebijakan pengiriman</Link></div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-[9px] text-white/35"><span>© 2026 FORKOM UMKM KEPUHARJO · Marketplace produk dan layanan lokal</span></div>
    </footer>
  );
}
