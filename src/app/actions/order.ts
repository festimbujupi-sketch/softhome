"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { sendOrderEmail } from "@/lib/email";

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Shkruani emrin dhe mbiemrin"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s/-]{7,}$/, "Numri i telefonit nuk duket i saktë"),
  email: z.string().trim().email("Email-i nuk është i saktë").optional().or(z.literal("")),
  city: z.string().trim().min(2, "Zgjidhni qytetin"),
  address: z.string().trim().min(4, "Shkruani adresën"),
  note: z.string().trim().max(500).optional().default(""),
  channel: z.enum(["cod", "whatsapp"]),
  items: z
    .array(z.object({ variantId: z.number().int(), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Shporta është bosh"),
});

export type PlaceOrderInput = z.input<typeof orderSchema>;
export type PlaceOrderResult =
  | { ok: true; number: string; whatsappUrl?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Ju lutem kontrolloni të dhënat.", fieldErrors };
  }
  const data = parsed.data;
  const settings = await getSettings();

  // Load current prices and stock from the database, never trust the browser.
  const rows = await db
    .select({ variant: schema.variants, product: schema.products })
    .from(schema.variants)
    .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
    .where(inArray(schema.variants.id, data.items.map((i) => i.variantId)));

  const lines: {
    productId: number;
    variantId: number;
    productName: string;
    variantName: string;
    showVariant: boolean;
    sku: string | null;
    unitPrice: number;
    quantity: number;
  }[] = [];
  for (const item of data.items) {
    const row = rows.find((r) => r.variant.id === item.variantId);
    if (!row || !row.product.active) return { ok: false, error: "Një produkt në shportë nuk është më në dispozicion." };
    if (row.variant.stock < item.quantity) {
      return {
        ok: false,
        error: `Na vjen keq, nga "${row.product.name}${row.variant.name !== "Standard" ? " – " + row.variant.name : ""}" kanë mbetur vetëm ${row.variant.stock} copë.`,
      };
    }
    const variantCount = rows.filter((r) => r.product.id === row.product.id).length;
    lines.push({
      productId: row.product.id,
      variantId: row.variant.id,
      productName: row.product.name,
      variantName: row.variant.name,
      showVariant: variantCount > 1 || row.variant.name !== "Standard",
      sku: row.variant.sku,
      unitPrice: row.variant.price ?? row.product.price,
      quantity: item.quantity,
    });
  }

  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const deliveryFee = settings.freeDeliveryFrom > 0 && subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee;
  const total = subtotal + deliveryFee;

  let number = "";
  try {
    number = await db.transaction(async (tx) => {
      for (const l of lines) {
        const res = await tx
          .update(schema.variants)
          .set({ stock: sql`${schema.variants.stock} - ${l.quantity}` })
          .where(and(eq(schema.variants.id, l.variantId), gte(schema.variants.stock, l.quantity)));
        if (res.rowsAffected !== 1) throw new Error("OUT_OF_STOCK");
      }
      const [{ next }] = await tx
        .select({ next: sql<number>`coalesce(max(${schema.orders.id}), 0) + 1001` })
        .from(schema.orders);
      const orderNumber = `SH-${next}`;
      const [order] = await tx
        .insert(schema.orders)
        .values({
          number: orderNumber,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || null,
          city: data.city,
          address: data.address,
          note: data.note,
          channel: data.channel,
          subtotal,
          deliveryFee,
          total,
        })
        .returning();
      await tx.insert(schema.orderItems).values(
        lines.map(({ showVariant, ...l }) => (void showVariant, { ...l, orderId: order.id })),
      );
      return orderNumber;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "OUT_OF_STOCK") {
      return { ok: false, error: "Një nga produktet sapo u shit. Ju lutem rifreskoni shportën." };
    }
    console.error(err);
    return { ok: false, error: "Porosia nuk u dërgua. Provoni përsëri ose na shkruani në WhatsApp." };
  }

  await sendOrderEmail({ number, data, lines, subtotal, deliveryFee, total, to: settings.orderNotifyEmail }).catch(
    (err) => console.error("Order email failed", err),
  );

  if (data.channel === "whatsapp") {
    const text = [
      `Përshëndetje! Dëshiroj të porosis (porosia ${number}):`,
      "",
      ...lines.map(
        (l) =>
          `• ${l.quantity} × ${l.productName}${l.showVariant ? ` (${l.variantName})` : ""} — ${formatPrice(l.unitPrice * l.quantity)}`,
      ),
      "",
      `Dërgesa: ${deliveryFee ? formatPrice(deliveryFee) : "falas"}`,
      `Totali: ${formatPrice(total)}`,
      "",
      `Emri: ${data.customerName}`,
      `Tel: ${data.phone}`,
      `Adresa: ${data.address}, ${data.city}`,
      data.note ? `Shënim: ${data.note}` : "",
    ]
      .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
      .join("\n");
    return { ok: true, number, whatsappUrl: `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}` };
  }

  return { ok: true, number };
}
