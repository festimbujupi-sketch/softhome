"use server";

import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { destroySession, requireAdmin } from "@/lib/auth";
import { storeImage } from "@/lib/storage";
import { saveSettings, type ShopSettings } from "@/lib/settings";
import { slugify } from "@/lib/format";

export async function logout() {
  await destroySession();
  redirect("/admin/hyrje");
}

/* ---------- Images ---------- */

export async function uploadImages(formData: FormData): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();
  const base = slugify(String(formData.get("name") ?? "")) || "foto";
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  try {
    for (const file of files) {
      if (file.size > 25 * 1024 * 1024) return { urls, error: `${file.name} është më e madhe se 25 MB.` };
      urls.push(await storeImage(file, base));
    }
  } catch (err) {
    console.error(err);
    return { urls, error: "Fotoja nuk u ngarkua. Provoni një format tjetër (JPG, PNG, WEBP)." };
  }
  return { urls };
}

/* ---------- Products ---------- */

const productInput = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().min(2, "Emri është i detyrueshëm"),
  slug: z.string().trim().optional(),
  categoryId: z.number().int().nullable(),
  description: z.string(),
  details: z.string(),
  price: z.number().int().min(0, "Çmimi është i detyrueshëm"),
  compareAtPrice: z.number().int().nullable(),
  optionLabel: z.string().trim().min(1),
  featured: z.boolean(),
  active: z.boolean(),
  images: z.array(z.object({ id: z.number().int().optional(), url: z.string().min(1), alt: z.string() })),
  variants: z
    .array(
      z.object({
        id: z.number().int().optional(),
        name: z.string().trim().min(1, "Çdo variant duhet të ketë emër"),
        sku: z.string().trim().nullable(),
        colorHex: z.string().trim().nullable(),
        price: z.number().int().nullable(),
        stock: z.number().int(),
        imageUrl: z.string().nullable(),
      }),
    )
    .min(1, "Produkti duhet të ketë të paktën një variant"),
});

export type ProductInput = z.input<typeof productInput>;

export async function saveProduct(input: ProductInput): Promise<{ ok: boolean; error?: string; id?: number }> {
  await requireAdmin();
  const parsed = productInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const p = parsed.data;

  const slug = slugify(p.slug || p.name);
  const [clash] = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.slug, slug));
  if (clash && clash.id !== p.id) return { ok: false, error: `Adresa "${slug}" përdoret nga një produkt tjetër.` };

  const skus = p.variants.map((v) => v.sku).filter(Boolean) as string[];
  if (new Set(skus).size !== skus.length) return { ok: false, error: "Kodet (SKU) e varianteve duhet të jenë unike." };
  if (skus.length) {
    const taken = await db
      .select({ sku: schema.variants.sku, productId: schema.variants.productId })
      .from(schema.variants)
      .where(inArray(schema.variants.sku, skus));
    const conflict = taken.find((t) => t.productId !== p.id);
    if (conflict) return { ok: false, error: `Kodi ${conflict.sku} përdoret te një produkt tjetër.` };
  }

  const values = {
    name: p.name,
    slug,
    categoryId: p.categoryId,
    description: p.description,
    details: p.details,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    optionLabel: p.optionLabel,
    featured: p.featured,
    active: p.active,
    updatedAt: new Date(),
  };

  const productId = await db.transaction(async (tx) => {
    let id = p.id;
    if (id) {
      await tx.update(schema.products).set(values).where(eq(schema.products.id, id));
    } else {
      const [created] = await tx.insert(schema.products).values(values).returning({ id: schema.products.id });
      id = created.id;
    }

    // Images: keep the ones still listed, insert new ones, in the given order.
    const keepImageIds = p.images.map((i) => i.id).filter(Boolean) as number[];
    await tx
      .delete(schema.productImages)
      .where(
        keepImageIds.length
          ? and(eq(schema.productImages.productId, id), notInArray(schema.productImages.id, keepImageIds))
          : eq(schema.productImages.productId, id),
      );
    const urlToImageId = new Map<string, number>();
    for (const [i, img] of p.images.entries()) {
      if (img.id) {
        await tx
          .update(schema.productImages)
          .set({ sortOrder: i, alt: img.alt })
          .where(eq(schema.productImages.id, img.id));
        urlToImageId.set(img.url, img.id);
      } else {
        const [row] = await tx
          .insert(schema.productImages)
          .values({ productId: id, url: img.url, alt: img.alt, sortOrder: i })
          .returning({ id: schema.productImages.id });
        urlToImageId.set(img.url, row.id);
      }
    }

    // Variants: same approach. Clear SKUs first so swapped SKUs don't collide.
    const keepVariantIds = p.variants.map((v) => v.id).filter(Boolean) as number[];
    await tx
      .delete(schema.variants)
      .where(
        keepVariantIds.length
          ? and(eq(schema.variants.productId, id), notInArray(schema.variants.id, keepVariantIds))
          : eq(schema.variants.productId, id),
      );
    await tx.update(schema.variants).set({ sku: null }).where(eq(schema.variants.productId, id));
    for (const [i, v] of p.variants.entries()) {
      const row = {
        name: v.name,
        sku: v.sku || null,
        colorHex: v.colorHex || null,
        price: v.price,
        stock: v.stock,
        imageId: v.imageUrl ? (urlToImageId.get(v.imageUrl) ?? null) : null,
        sortOrder: i,
      };
      if (v.id) await tx.update(schema.variants).set(row).where(eq(schema.variants.id, v.id));
      else await tx.insert(schema.variants).values({ ...row, productId: id });
    }
    return id;
  });

  revalidatePath("/", "layout");
  return { ok: true, id: productId };
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await db.delete(schema.products).where(eq(schema.products.id, id));
  revalidatePath("/", "layout");
  redirect("/admin/produktet");
}

export async function setVariantStock(variantId: number, stock: number) {
  await requireAdmin();
  await db.update(schema.variants).set({ stock: Math.max(0, Math.round(stock)) }).where(eq(schema.variants.id, variantId));
  revalidatePath("/", "layout");
}

/* ---------- Categories ---------- */

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug = slugify(String(formData.get("slug") || name));
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  let imageUrl = String(formData.get("imageUrl") ?? "") || null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) imageUrl = await storeImage(file, slug);

  const values = { name, slug, description, sortOrder, imageUrl, updatedAt: new Date() };
  if (id) await db.update(schema.categories).set(values).where(eq(schema.categories.id, id));
  else await db.insert(schema.categories).values(values);
  revalidatePath("/", "layout");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(schema.categories).where(eq(schema.categories.id, id));
  revalidatePath("/", "layout");
}

/* ---------- Orders ---------- */

const statuses = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

export async function updateOrder(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as (typeof statuses)[number];
  const adminNote = String(formData.get("adminNote") ?? "");
  if (!statuses.includes(status)) return;

  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(schema.orders).where(eq(schema.orders.id, id));
    if (!order) return;
    // Cancelling returns the items to stock; re-opening takes them out again.
    const wasCancelled = order.status === "cancelled";
    const isCancelled = status === "cancelled";
    if (wasCancelled !== isCancelled) {
      const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
      for (const item of items) {
        if (!item.variantId) continue;
        const delta = isCancelled ? item.quantity : -item.quantity;
        await tx
          .update(schema.variants)
          .set({ stock: sql`max(0, ${schema.variants.stock} + ${delta})` })
          .where(eq(schema.variants.id, item.variantId));
      }
    }
    await tx.update(schema.orders).set({ status, adminNote, updatedAt: new Date() }).where(eq(schema.orders.id, id));
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

/* ---------- Settings ---------- */

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const text = (k: string) => String(formData.get(k) ?? "").trim();
  const money = (k: string) => Math.round(Number(text(k).replace(",", ".") || 0) * 100);
  const values: Partial<ShopSettings> = {
    shopName: text("shopName"),
    tagline: text("tagline"),
    heroTitle: text("heroTitle"),
    heroSubtitle: text("heroSubtitle"),
    whatsapp: text("whatsapp").replace(/\D/g, ""),
    phone: text("phone"),
    email: text("email"),
    orderNotifyEmail: text("orderNotifyEmail"),
    address: text("address"),
    openingHours: text("openingHours"),
    instagram: text("instagram"),
    facebook: text("facebook"),
    deliveryFee: money("deliveryFee"),
    freeDeliveryFrom: money("freeDeliveryFrom"),
    deliveryTime: text("deliveryTime"),
    aboutText: String(formData.get("aboutText") ?? "").replace(/\r\n/g, "\n").trim(),
  };
  await saveSettings(values);
  revalidatePath("/", "layout");
  redirect("/admin/cilesimet?ruajtur=1");
}
