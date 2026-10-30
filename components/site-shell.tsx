import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ChatWidget } from "./chat-widget";
import { getPublicCatalog } from "@/lib/catalog-db";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const { entries } = await getPublicCatalog();
  return <div className="min-h-screen bg-[#f5f8f4] font-sans text-ink"><SiteHeader catalogEntries={entries} />{children}<SiteFooter /><ChatWidget /></div>;
}
