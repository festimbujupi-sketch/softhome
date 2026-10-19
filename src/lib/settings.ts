import { db, schema } from "@/db";

export type ShopSettings = {
  shopName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  whatsapp: string; // international format without "+", e.g. 38344123456
  phone: string;
  email: string;
  orderNotifyEmail: string;
  address: string;
  openingHours: string;
  instagram: string;
  facebook: string;
  deliveryFee: number; // cents
  freeDeliveryFrom: number; // cents, 0 = never free
  deliveryTime: string;
  aboutText: string;
};

export const defaultSettings: ShopSettings = {
  shopName: "Soft Home",
  tagline: "Tekstile shtëpie që ndihen si përqafim",
  heroTitle: "Butësi për çdo cep të shtëpisë",
  heroSubtitle:
    "Peshqirë, çarçafë, jorganë dhe aksesorë banjoje të përzgjedhur me kujdes — me pagesë në dorëzim kudo në Kosovë.",
  whatsapp: "38344000000",
  phone: "+383 44 000 000",
  email: "info@softhome.com",
  orderNotifyEmail: "",
  address: "Prishtinë, Kosovë",
  openingHours: "E hënë – E shtunë, 09:00 – 20:00",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  deliveryFee: 200,
  freeDeliveryFrom: 5000,
  deliveryTime: "1–3 ditë pune",
  aboutText:
    "Soft Home lindi nga një ide e thjeshtë: shtëpia duhet të jetë vendi më i butë në botë. Ne përzgjedhim tekstile me cilësi të lartë — nga peshqirët e trashë prej pambuku te çarçafët që marrin frymë — që e bëjnë rutinën e përditshme pak më të ngrohtë.\n\nÇdo produkt kontrollohet nga ne para se të dalë nga dyqani, dhe porosinë e paguani vetëm kur e merrni në dorë.",
};

export async function getSettings(): Promise<ShopSettings> {
  const rows = await db.select().from(schema.settings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)]));
  return { ...defaultSettings, ...stored };
}

export async function saveSettings(values: Partial<ShopSettings>) {
  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(schema.settings)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: JSON.stringify(value) } });
  }
}
