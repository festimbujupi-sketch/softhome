import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-card";
import { getCategories, getProductCards } from "@/lib/queries";
import { CategoryHeader, CategoryTabs } from "@/components/category-nav";

export const metadata: Metadata = { title: "Të gjitha produktet" };

export default async function AllProductsPage() {
  const [products, categories] = await Promise.all([getProductCards(), getCategories()]);
  const order = new Map(categories.map((c, i) => [c.id, i]));
  products.sort((a, b) => (order.get(a.categoryId ?? -1) ?? 99) - (order.get(b.categoryId ?? -1) ?? 99));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <CategoryHeader title="Të gjitha produktet" />
      <CategoryTabs categories={categories} />
      <ProductGrid products={products} />
    </div>
  );
}
