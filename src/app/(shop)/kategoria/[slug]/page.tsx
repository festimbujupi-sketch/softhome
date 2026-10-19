import { CategoryHeader, CategoryTabs } from "@/components/category-nav";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-card";
import { getCategories, getCategoryBySlug, getProductCards } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProductCards({ categoryId: category.id }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <CategoryHeader title={category.name} description={category.description} />
      <CategoryTabs categories={categories} active={slug} />
      <ProductGrid products={products} />
    </div>
  );
}
