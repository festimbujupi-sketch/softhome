import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";

const { products, categories, productImages, variants } = schema;

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug));
  return row ?? null;
}

export type ProductCardData = Awaited<ReturnType<typeof getProductCards>>[number];

/** Active products with their first image, variant swatches and total stock. */
export async function getProductCards(opts: { categoryId?: number; featured?: boolean } = {}) {
  const conditions = [eq(products.active, true)];
  if (opts.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts.featured) conditions.push(eq(products.featured, true));

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(asc(products.sortOrder), desc(products.createdAt));
  if (rows.length === 0) return [];

  const ids = rows.map((p) => p.id);
  const [images, vars] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
    db.select().from(variants).where(inArray(variants.productId, ids)).orderBy(asc(variants.sortOrder)),
  ]);

  return rows.map((p) => {
    const imgs = images.filter((i) => i.productId === p.id);
    const vs = vars.filter((v) => v.productId === p.id);
    return {
      ...p,
      image: imgs[0]?.url ?? null,
      hoverImage: imgs[1]?.url ?? null,
      swatches: vs.filter((v) => v.colorHex).map((v) => ({ name: v.name, hex: v.colorHex! })),
      variantCount: vs.length,
      inStock: vs.some((v) => v.stock > 0),
      minPrice: Math.min(...vs.map((v) => v.price ?? p.price), p.price),
    };
  });
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)));
  if (!product) return null;

  const [images, vars, category] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(variants).where(eq(variants.productId, product.id)).orderBy(asc(variants.sortOrder)),
    product.categoryId
      ? db.select().from(categories).where(eq(categories.id, product.categoryId)).then((r) => r[0] ?? null)
      : Promise.resolve(null),
  ]);
  return { product, images, variants: vars, category };
}
