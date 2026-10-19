import { Resend } from "resend";
import { formatPrice, channelLabels } from "./format";

type Line = { productName: string; variantName: string; showVariant: boolean; quantity: number; unitPrice: number };

/**
 * Emails the shop when a new order arrives. Does nothing until RESEND_API_KEY
 * is set and an order notification email is filled in under Admin → Cilësimet.
 */
export async function sendOrderEmail(args: {
  number: string;
  to: string;
  data: { customerName: string; phone: string; city: string; address: string; note?: string; channel: "cod" | "whatsapp" };
  lines: Line[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !args.to) {
    console.log(`[order] ${args.number} – ${args.data.customerName} – ${formatPrice(args.total)} (email not configured)`);
    return;
  }
  const { data, lines } = args;
  const rows = lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0">${l.quantity} × ${escape(l.productName)}${l.showVariant ? ` (${escape(l.variantName)})` : ""}</td><td style="text-align:right">${formatPrice(l.unitPrice * l.quantity)}</td></tr>`,
    )
    .join("");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  await new Resend(apiKey).emails.send({
    from: process.env.EMAIL_FROM ?? "Soft Home <onboarding@resend.dev>",
    to: args.to,
    subject: `Porosi e re ${args.number} – ${formatPrice(args.total)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px">
        <h2 style="font-weight:400">Porosi e re ${args.number}</h2>
        <p><strong>${escape(data.customerName)}</strong><br>${escape(data.phone)}<br>${escape(data.address)}, ${escape(data.city)}</p>
        <p>Mënyra: ${channelLabels[data.channel]}</p>
        ${data.note ? `<p>Shënim: ${escape(data.note)}</p>` : ""}
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #ddd">${rows}
          <tr><td style="padding:6px 0;border-top:1px solid #ddd">Dërgesa</td><td style="text-align:right;border-top:1px solid #ddd">${args.deliveryFee ? formatPrice(args.deliveryFee) : "falas"}</td></tr>
          <tr><td style="padding:6px 0"><strong>Totali</strong></td><td style="text-align:right"><strong>${formatPrice(args.total)}</strong></td></tr>
        </table>
        ${siteUrl ? `<p><a href="${siteUrl}/admin/porosite">Hap porositë në panel</a></p>` : ""}
      </div>`,
  });
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
