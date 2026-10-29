import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ChatWidget } from "./chat-widget";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5f8f4] font-sans text-ink"><SiteHeader />{children}<SiteFooter /><ChatWidget /></div>;
}
