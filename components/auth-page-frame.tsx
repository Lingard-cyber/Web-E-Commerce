import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import type { ReactNode } from "react";

export function AuthPageFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f5f8f4] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-[11px] font-extrabold tracking-wide text-forest-900 sm:text-xs">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-accent bg-forest-800 text-accent">
            <Store size={18} />
          </span>
          <span>KEPUHARJO MARKET</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-white px-3 py-2 text-[10px] font-bold text-forest-800 transition hover:border-forest-700 hover:bg-green-50">
          <ArrowLeft size={13} />
          Kembali ke beranda
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-142px)] items-center justify-center py-8 sm:py-10">
        {children}
      </div>

      <p className="text-center text-[9px] text-muted">© 2026 Kepuharjo Market · Halaman autentikasi</p>
    </main>
  );
}
