import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, schema } from "@/db";
import { ProductEditor } from "@/components/admin/product-editor";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "i-ri";
  const categories = await db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder));

  let initial = null;
  if (!isNew) {
    const productId = Number(id);
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, productId));
    if (!product) notFound();
    const [images, variants] = await Promise.all([
      db.select().from(schema.productImages).where(eq(schema.productImages.productId, productId)).orderBy(asc(schema.productImages.sortOrder)),
      db.select().from(schema.variants).where(eq(schema.variants.productId, productId)).orderBy(asc(schema.variants.sortOrder)),
    ]);
    initial = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      description: product.description,
      details: product.details,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      optionLabel: product.optionLabel,
      featured: product.featured,
      active: product.active,
      images: images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        colorHex: v.colorHex,
        price: v.price,
        stock: v.stock,
        imageUrl: images.find((i) => i.id === v.imageId)?.url ?? null,
      })),
    };
  }

  return (
    <>
      <Link href="/admin/produktet" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> Produktet
      </Link>
      <ProductEditor initial={initial} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
