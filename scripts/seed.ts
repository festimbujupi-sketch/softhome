/**
 * Optimizes the client's photos into public/products and fills the database
 * with the starter catalogue.
 *
 *   npm run seed            -> only seeds when the catalogue is empty
 *   npm run seed -- --reset -> wipes products/categories and seeds again
 *
 * Photos are read from the parent "Soft Home" folder (override with PHOTOS_DIR).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { sql } from "drizzle-orm";
import { db, schema } from "../src/db";
import { catalog } from "./catalog";

const photosDir = process.env.PHOTOS_DIR ?? path.resolve(process.cwd(), "..");
const publicDir = path.resolve(process.cwd(), "public");
const reset = process.argv.includes("--reset");

const processed = new Map<string, string>();

async function optimize(source: string, folder: string, name: string) {
  const cached = processed.get(source);
  if (cached) return cached;
  const outRel = `/products/${folder}/${name}.webp`;
  const outAbs = path.join(publicDir, outRel);
  if (!fs.existsSync(outAbs)) {
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    await sharp(path.join(photosDir, source))
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outAbs);
    console.log("  image", outRel);
  }
  processed.set(source, outRel);
  return outRel;
}

async function brandAssets() {
  const outDir = path.join(publicDir, "brand");
  fs.mkdirSync(outDir, { recursive: true });
  for (const [src, out] of [
    ["Logo/soft home black.png", "logo-black.png"],
    ["Logo/soft home white.png", "logo-white.png"],
  ]) {
    const target = path.join(outDir, out);
    if (!fs.existsSync(target)) {
      await sharp(path.join(photosDir, src)).trim().resize({ width: 900 }).png().toFile(target);
    }
  }
  const icon = path.join(publicDir, "..", "src", "app", "icon.png");
  if (!fs.existsSync(icon)) {
    await sharp(path.join(photosDir, "Logo/soft-home-pfp.jpg")).resize(256, 256).png().toFile(icon);
  }
}

async function main() {
  await brandAssets();

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(schema.products);
  if (count > 0 && !reset) {
    console.log(`Catalogue already has ${count} products. Use --reset to start over.`);
    return;
  }
  if (reset) {
    await db.delete(schema.variants);
    await db.delete(schema.productImages);
    await db.delete(schema.products);
    await db.delete(schema.categories);
  }

  for (const [ci, cat] of catalog.entries()) {
    console.log(cat.name);
    const imageUrl = await optimize(cat.image, cat.slug, "kategoria");
    const [category] = await db
      .insert(schema.categories)
      .values({ slug: cat.slug, name: cat.name, description: cat.description, imageUrl, sortOrder: ci })
      .returning();

    for (const [pi, p] of cat.products.entries()) {
      const [product] = await db
        .insert(schema.products)
        .values({
          slug: p.slug,
          name: p.name,
          categoryId: category.id,
          description: p.description,
          details: p.details,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          optionLabel: p.optionLabel ?? "Ngjyra",
          featured: p.featured ?? false,
          sortOrder: pi,
        })
        .returning();

      const imageIds = new Map<string, number>();
      for (const [ii, src] of p.images.entries()) {
        const url = await optimize(src, cat.slug, `${p.slug}-${ii + 1}`);
        const [img] = await db
          .insert(schema.productImages)
          .values({ productId: product.id, url, alt: p.name, sortOrder: ii })
          .returning();
        imageIds.set(src, img.id);
      }

      for (const [vi, v] of p.variants.entries()) {
        await db.insert(schema.variants).values({
          productId: product.id,
          name: v.name,
          colorHex: v.colorHex,
          sku: `${cat.skuPrefix}-${String(pi + 1).padStart(3, "0")}-${String(vi + 1).padStart(2, "0")}`,
          stock: 20,
          imageId: v.image ? imageIds.get(v.image) : undefined,
          sortOrder: vi,
        });
      }
    }
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
