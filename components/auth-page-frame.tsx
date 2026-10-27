import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AuthPageFrame({ children, showBack = true }: { children: ReactNode; showBack?: boolean }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f5f8f4] px-4 py-5 sm:px-6 sm:py-8">
      <header className="mx-auto flex w-full max-w-[1180px] flex-col items-center">
        <Link href="/" className="flex items-center gap-2 text-center text-[11px] font-extrabold tracking-wide text-forest-900 sm:text-xs">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-accent bg-white">
            <img src="/forkom-umkm-kepuharjo.jpg" alt="Logo FORKOM UMKM KEPUHARJO" className="h-full w-full object-cover" />
          </span>
          <span>FORKOM UMKM KEPUHARJO</span>
        </Link>
        {showBack && <Link href="/" className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-3 py-2 text-[10px] font-bold text-forest-800 transition hover:border-forest-700 hover:bg-green-50">
          <ArrowLeft size={13} />
          Kembali ke beranda
        </Link>}
      </header>

      <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
        {children}
      </div>

      <p className="text-center text-[9px] text-muted">© 2026 Kepuharjo Market · Halaman autentikasi</p>
    </main>
  );
}
