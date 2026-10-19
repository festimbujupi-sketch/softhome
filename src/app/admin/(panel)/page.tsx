import Link from "next/link";
import { desc, eq, gte, lte, ne, sql, and } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Përmbledhja" };

export default async function DashboardPage() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [[stats], [newOrders], [lowStock], recent, low] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)`, revenue: sql<number>`coalesce(sum(${schema.orders.total}), 0)` })
      .from(schema.orders)
      .where(and(gte(schema.orders.createdAt, since), ne(schema.orders.status, "cancelled"))),
    db.select({ count: sql<number>`count(*)` }).from(schema.orders).where(eq(schema.orders.status, "new")),
    db.select({ count: sql<number>`count(*)` }).from(schema.variants).where(lte(schema.variants.stock, 3)),
    db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(8),
    db
      .select({
        id: schema.variants.id,
        variant: schema.variants.name,
        stock: schema.variants.stock,
        productId: schema.products.id,
        product: schema.products.name,
      })
      .from(schema.variants)
      .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
      .where(lte(schema.variants.stock, 3))
      .orderBy(schema.variants.stock)
      .limit(8),
  ]);

  return (
    <>
      <PageHeader title="Përmbledhja" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Porosi të reja" value={newOrders.count} href="/admin/porosite?status=new" highlight={newOrders.count > 0} />
        <Stat label="Porosi (30 ditë)" value={stats.count} />
        <Stat label="Shitje (30 ditë)" value={formatPrice(stats.revenue)} />
        <Stat label="Me stok të ulët" value={lowStock.count} href="/admin/produktet?stok=ulet" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm">Porositë e fundit</h2>
            <Link href="/admin/porosite" className="text-sm text-clay hover:underline">Të gjitha</Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Ende nuk ka porosi.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/porosite/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-linen">
                    <span className="w-20 font-medium">{o.number}</span>
                    <span className="min-w-32 flex-1">{o.customerName}</span>
                    <span className="text-muted">{formatDate(o.createdAt)}</span>
                    <StatusBadge status={o.status} />
                    <span className="w-20 text-right">{formatPrice(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm">Stok i ulët (≤ 3)</h2>
          </div>
          {low.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Të gjitha produktet kanë stok.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {low.map((v) => (
                <li key={v.id}>
                  <Link href={`/admin/produktet/${v.productId}`} className="flex justify-between gap-4 px-5 py-3 hover:bg-linen">
                    <span>
                      {v.product}
                      {v.variant !== "Standard" && <span className="text-muted"> · {v.variant}</span>}
                    </span>
                    <span className={v.stock === 0 ? "text-danger" : "text-clay"}>{v.stock}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, href, highlight }: { label: string; value: string | number; href?: string; highlight?: boolean }) {
  const body = (
    <Card className={`p-5 ${highlight ? "border-clay" : ""} ${href ? "transition hover:border-ink/40" : ""}`}>
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-light">{value}</p>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
