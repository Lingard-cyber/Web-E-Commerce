import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Admin Forkom UMKM Kepuharjo",
  description: "Dashboard operasional Admin Forkom UMKM Kepuharjo.",
  icons: {
    icon: "/forkom-favicon.svg",
    shortcut: "/forkom-favicon.svg",
    apple: "/forkom-umkm-kepuharjo.jpg",
  },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
