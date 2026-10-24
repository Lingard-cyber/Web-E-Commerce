import type { Metadata } from "next";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kepuharjo Market | Produk Lokal, Pasar Lebih Luas",
  description: "Etalase digital produk lokal dan jasa UMKM Kalurahan Kepuharjo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><NavigationProgress />{children}</body>
    </html>
  );
}
