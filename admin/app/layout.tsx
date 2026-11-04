import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Admin Forkom UMKM Kepuharjo",
  description: "Dashboard operasional Admin Forkom UMKM Kepuharjo.",
  icons: {
    icon: "/favicon-kepuharjo.svg",
    shortcut: "/favicon-kepuharjo.svg",
    apple: "/logo-kepuharjo.jpeg",
  },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
