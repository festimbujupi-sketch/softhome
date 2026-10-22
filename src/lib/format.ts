/** 1250 -> "12,50 €". Formatted by hand so server and browser always agree. */
export function formatPrice(cents: number) {
  const [whole, decimals] = (Math.abs(cents) / 100).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cents < 0 ? "-" : ""}${grouped},${decimals} €`;
}

/** "12,50" or "12.50" -> 1250 */
export function parsePrice(input: string): number | null {
  const cleaned = input.replace(/[^\d.,]/g, "").replace(",", ".");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

/** Discount in whole percent, e.g. 1990 -> 1490 gives 25. */
export function discountPercent(price: number, compareAt: number | null | undefined) {
  return compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;
}

export function centsToInput(cents: number | null | undefined) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const orderStatusLabels = {
  new: "E re",
  confirmed: "E konfirmuar",
  shipped: "Në dërgesë",
  delivered: "E dorëzuar",
  cancelled: "E anuluar",
} as const;

export const channelLabels = {
  cod: "Pagesë në dorëzim",
  whatsapp: "WhatsApp",
} as const;
