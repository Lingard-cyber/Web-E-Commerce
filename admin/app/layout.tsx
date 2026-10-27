import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Admin Forkom UMKM Kepuharjo",
  description: "Dashboard operasional Admin Forkom UMKM Kepuharjo.",
  icons: {
    icon: "/forkom-favicon-small.png",
    shortcut: "/forkom-favicon-small.png",
    apple: "/forkom-favicon-small.png",
  },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
