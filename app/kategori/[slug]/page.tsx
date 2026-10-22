import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { ProductBrowser } from "@/components/product-browser";
import { SiteShell } from "@/components/site-shell";
import { categories } from "@/lib/catalog";

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export default function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) notFound();
  return <SiteShell><main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14"><PageHeading eyebrow="Kategori Kepuharjo Market" title={category.name} description={category.description} action={{ label: "Semua kategori", href: "/kategori" }} /><ProductBrowser initialCategory={category.slug} /></main></SiteShell>;
}
