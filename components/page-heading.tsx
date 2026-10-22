import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: { label: string; href: string } }) {
  return <div className="animate-fade-up mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-forest-700">{eyebrow}</p><h1 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.8rem)] font-bold leading-[.98] tracking-[-.04em] text-ink">{title}</h1>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>}</div>{action && <Link href={action.href} className="inline-flex min-h-10 w-fit shrink-0 items-center rounded-full bg-forest-800 px-4 text-[10px] font-bold text-white hover:-translate-y-1 hover:bg-forest-700">{action.label}<ArrowRight size={13} className="ml-2" /></Link>}</div>;
}
