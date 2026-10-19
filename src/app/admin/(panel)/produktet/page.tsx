import Image from "next/image";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, schema } from "@/db";
import { Card, PageHeader } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Produktet" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategoria?: string; stok?: string }>;
}) {
  const { q = "", kategoria, stok } = await searchParams;
  const [products, categories, images, variants] = await Promise.all([
    db.select().from(schema.products).orderBy(asc(schema.products.categoryId), asc(schema.products.sortOrder)),
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db.select().from(schema.productImages).where(eq(schema.productImages.sortOrder, 0)),
    db.select().from(schema.variants),
  ]);

  const term = q.trim().toLowerCase();
  const rows = products
    .map((p) => {
      const vs = variants.filter((v) => v.productId === p.id);
      return {
        ...p,
        image: images.find((i) => i.productId === p.id)?.url,
        category: categories.find((c) => c.id === p.categoryId)?.name ?? "—",
        stock: vs.reduce((n, v) => n + v.stock, 0),
        minStock: Math.min(...vs.map((v) => v.stock)),
        variantCount: vs.length,
        skus: vs.map((v) => v.sku ?? "").join(" ").toLowerCase(),
      };
    })
    .filter((p) => !kategoria || String(p.categoryId) === kategoria)
    .filter((p) => !term || p.name.toLowerCase().includes(term) || p.skus.includes(term))
    .filter((p) => stok !== "ulet" || p.minStock <= 3);

  return (
    <>
      <PageHeader title="Produktet">
        <Link href="/admin/produktet/i-ri" className="btn btn-primary !min-h-10 rounded !px-4 !text-xs">
          <Plus size={16} /> Produkt i ri
        </Link>
      </PageHeader>

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Kërko sipas emrit ose kodit (SKU)…" className="field !min-h-10 max-w-xs rounded" />
        <select name="kategoria" defaultValue={kategoria ?? ""} className="field !min-h-10 max-w-52 rounded">
          <option value="">Të gjitha kategoritë</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="stok" defaultValue={stok ?? ""} className="field !min-h-10 max-w-44 rounded">
          <option value="">Çdo stok</option>
          <option value="ulet">Stok i ulët (≤ 3)</option>
        </select>
        <button className="btn btn-outline !min-h-10 rounded !px-4 !text-xs">Filtro</button>
      </form>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3 font-normal">Produkti</th>
              <th className="px-4 py-3 font-normal">Kategoria</th>
              <th className="px-4 py-3 font-normal">Çmimi</th>
              <th className="px-4 py-3 font-normal">Stoku</th>
              <th className="px-4 py-3 font-normal">Statusi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-linen">
                <td className="px-4 py-2">
                  <Link href={`/admin/produktet/${p.id}`} className="flex items-center gap-3">
                    <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-sand">
                      {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}
                    </span>
                    <span>
                      <span className="block hover:underline">{p.name}</span>
                      {p.variantCount > 1 && <span className="text-xs text-muted">{p.variantCount} variante</span>}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted">{p.category}</td>
                <td className="px-4 py-2">{formatPrice(p.price)}</td>
                <td className={`px-4 py-2 ${p.stock === 0 ? "text-danger" : p.minStock <= 3 ? "text-clay" : ""}`}>{p.stock}</td>
                <td className="px-4 py-2">
                  {p.active ? (
                    <span className="text-emerald-700">Aktiv</span>
                  ) : (
                    <span className="text-muted">Fshehur</span>
                  )}
                  {p.featured && <span className="ml-2 text-xs text-clay">★</span>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">Nuk u gjet asnjë produkt.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
