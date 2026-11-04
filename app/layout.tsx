import type { Metadata } from "next";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forkom UMKM Kepuharjo",
  description: "Etalase digital produk lokal dan jasa UMKM Kalurahan Kepuharjo.",
  icons: {
    icon: "/favicon-kepuharjo.svg",
    shortcut: "/favicon-kepuharjo.svg",
    apple: "/logo-kepuharjo.jpeg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><NavigationProgress />{children}</body>
    </html>
  );
}
