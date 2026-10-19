import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { OrderStatus } from "@/db/schema";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { channelLabels, formatDate, formatPrice, orderStatusLabels } from "@/lib/format";

export const metadata = { title: "Porositë" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const valid = status && status in orderStatusLabels ? (status as OrderStatus) : undefined;
  const orders = await db
    .select()
    .from(schema.orders)
    .where(valid ? eq(schema.orders.status, valid) : undefined)
    .orderBy(desc(schema.orders.createdAt))
    .limit(200);

  const tab = "rounded-full border px-3 py-1 text-xs";
  return (
    <>
      <PageHeader title="Porositë" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/porosite" className={`${tab} ${!valid ? "border-ink bg-ink text-white" : "border-stone bg-white"}`}>
          Të gjitha
        </Link>
        {Object.entries(orderStatusLabels).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/porosite?status=${key}`}
            className={`${tab} ${valid === key ? "border-ink bg-ink text-white" : "border-stone bg-white"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3 font-normal">Nr.</th>
              <th className="px-4 py-3 font-normal">Klienti</th>
              <th className="px-4 py-3 font-normal">Qyteti</th>
              <th className="px-4 py-3 font-normal">Data</th>
              <th className="px-4 py-3 font-normal">Mënyra</th>
              <th className="px-4 py-3 font-normal">Statusi</th>
              <th className="px-4 py-3 text-right font-normal">Totali</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-linen">
                <td className="px-4 py-3">
                  <Link href={`/admin/porosite/${o.id}`} className="font-medium hover:underline">{o.number}</Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/porosite/${o.id}`}>
                    {o.customerName}
                    <span className="block text-xs text-muted">{o.phone}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{o.city}</td>
                <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-muted">{channelLabels[o.channel]}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right">{formatPrice(o.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted">Nuk ka porosi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
