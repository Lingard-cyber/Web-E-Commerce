"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== window.location.pathname) setActive(true);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return <div aria-hidden="true" className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-accent shadow-[0_0_14px_rgba(248,196,0,.8)] transition-all duration-300 ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />;
}
