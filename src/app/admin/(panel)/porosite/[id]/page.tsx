import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Phone } from "lucide-react";
import { db, schema } from "@/db";
import { Card, StatusBadge } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/whatsapp-button";
import { channelLabels, formatDate, formatPrice, orderStatusLabels } from "@/lib/format";
import { updateOrder } from "../../../actions";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  if (!order) notFound();
  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  const phoneDigits = order.phone.replace(/\D/g, "").replace(/^0/, "383");

  return (
    <>
      <Link href="/admin/porosite" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> Porositë
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-normal">Porosia {order.number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted">{formatDate(order.createdAt)} · {channelLabels[order.channel]}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-5 py-3 font-normal">Produkti</th>
                <th className="px-5 py-3 font-normal">Kodi</th>
                <th className="px-5 py-3 text-right font-normal">Sasia</th>
                <th className="px-5 py-3 text-right font-normal">Shuma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    {item.productId ? (
                      <Link href={`/admin/produktet/${item.productId}`} className="hover:underline">{item.productName}</Link>
                    ) : (
                      item.productName
                    )}
                    {item.variantName !== "Standard" && <span className="block text-xs text-muted">{item.variantName}</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{item.sku ?? "—"}</td>
                  <td className="px-5 py-3 text-right">{item.quantity} × {formatPrice(item.unitPrice)}</td>
                  <td className="px-5 py-3 text-right">{formatPrice(item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-line text-sm">
              <tr>
                <td colSpan={3} className="px-5 pt-3 text-right text-muted">Nëntotali</td>
                <td className="px-5 pt-3 text-right">{formatPrice(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-5 py-1 text-right text-muted">Dërgesa</td>
                <td className="px-5 py-1 text-right">{order.deliveryFee ? formatPrice(order.deliveryFee) : "Falas"}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-5 pb-4 text-right">Totali për pagesë</td>
                <td className="px-5 pb-4 text-right text-base font-medium">{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 text-sm">
            <h2 className="mb-3 text-xs uppercase tracking-[0.08em] text-muted">Klienti</h2>
            <p className="text-base">{order.customerName}</p>
            <p className="mt-1">{order.address}</p>
            <p>{order.city}</p>
            {order.email && <p className="mt-1 text-muted">{order.email}</p>}
            {order.note && <p className="mt-3 rounded bg-linen p-3">“{order.note}”</p>}
            <div className="mt-4 flex gap-2">
              <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="btn btn-outline !min-h-9 flex-1 rounded !px-3 !text-xs">
                <Phone size={14} /> {order.phone}
              </a>
              <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp !min-h-9 rounded !px-3" aria-label="WhatsApp">
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </Card>

          <Card className="p-5">
            <form action={updateOrder} className="space-y-4">
              <input type="hidden" name="id" value={order.id} />
              <div>
                <label className="label">Statusi</label>
                <select name="status" defaultValue={order.status} className="field rounded">
                  {Object.entries(orderStatusLabels).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted">Kur anulohet, sasitë kthehen në stok.</p>
              </div>
              <div>
                <label className="label">Shënim i brendshëm</label>
                <textarea name="adminNote" rows={3} defaultValue={order.adminNote} className="field rounded" />
              </div>
              <button className="btn btn-primary !min-h-10 w-full rounded">Ruaj</button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
