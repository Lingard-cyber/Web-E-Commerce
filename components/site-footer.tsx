import { ExternalLink, Facebook, Globe2, Instagram } from "lucide-react";

const officialLinks = [
  { label: "Instagram · Halo Kepuharjo", href: "https://www.instagram.com/halokepuharjo/", icon: Instagram },
  { label: "Facebook · Halo Kepuharjo", href: "https://www.facebook.com/halokepuharjo/", icon: Facebook },
  { label: "Website resmi Kalurahan", href: "https://kepuharjosid.slemankab.go.id/home/", icon: Globe2 },
];

const navigationLinks = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Jasa & Layanan", href: "/jasa" },
  { label: "Kategori", href: "/kategori" },
  { label: "UMKM", href: "/umkm" },
  { label: "Bantuan", href: "/bantuan" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-white">
      <img src="/kepuharjo-footer.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-[1.08] object-cover object-[center_24%] opacity-85" />
      <div className="absolute inset-0 bg-forest-950/52" />

      <div className="relative z-10">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 md:grid-cols-[1.1fr_.9fr] md:gap-12 md:py-12">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-lg"><img src="/forkom-umkm-kepuharjo.jpg" alt="Logo FORKOM UMKM KEPUHARJO" className="h-full w-full object-cover" /></span>
            <div><p className="text-sm font-bold text-white">FORKOM UMKM KEPUHARJO</p><p className="mt-1 text-xs text-white/75">Media sosial dan website resmi Kepuharjo</p></div>
          </div>

          <nav aria-label="Navigasi footer">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-accent">Navigasi</h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              {navigationLinks.map((item) => <a key={item.href} href={item.href} className="text-xs text-white/75 hover:text-accent">{item.label}</a>)}
            </div>
          </nav>

          <div className="sm:col-span-2 md:col-span-2">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-accent">Ikuti informasi Kepuharjo</h2>
            <div className="grid gap-3 sm:grid-cols-3">{officialLinks.map(({ label, href, icon: Icon }) => <a key={href} href={href} target="_blank" rel="noreferrer" className="group flex min-h-12 items-center gap-3 rounded-2xl border border-white/20 bg-forest-950/55 px-4 text-xs font-semibold text-white/90 transition hover:-translate-y-1 hover:border-accent hover:bg-forest-950/80 hover:text-accent"><Icon size={18} className="shrink-0" /><span className="min-w-0 flex-1">{label}</span><ExternalLink size={13} className="shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" /></a>)}</div>
          </div>
        </div>
        <div className="border-t border-white/20 px-6 py-4 text-center text-[10px] text-white/70"><span>FORKOM UMKM KEPUHARJO · Kanal resmi dan informasi warga</span></div>
      </div>
    </footer>
  );
}
