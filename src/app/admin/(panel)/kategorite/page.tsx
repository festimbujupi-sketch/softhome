import Image from "next/image";
import { asc, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteCategory, saveCategory } from "../../actions";

export const metadata = { title: "Kategoritë" };

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db
      .select({ categoryId: schema.products.categoryId, count: sql<number>`count(*)` })
      .from(schema.products)
      .groupBy(schema.products.categoryId),
  ]);

  return (
    <>
      <PageHeader title="Kategoritë" />
      <div className="space-y-4">
        {categories.map((c) => (
          <Card key={c.id} className="p-5">
            <CategoryForm category={c} productCount={counts.find((x) => x.categoryId === c.id)?.count ?? 0} />
          </Card>
        ))}
        <Card className="border-dashed p-5">
          <h2 className="mb-4 text-sm">Kategori e re</h2>
          <CategoryForm />
        </Card>
      </div>
    </>
  );
}

function CategoryForm({ category, productCount }: { category?: typeof schema.categories.$inferSelect; productCount?: number }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded bg-sand md:w-44">
        {category?.imageUrl && <Image src={category.imageUrl} alt="" fill sizes="176px" className="object-cover" />}
      </div>
      <form action={saveCategory} className="grid flex-1 gap-3 sm:grid-cols-2">
        {category && <input type="hidden" name="id" value={category.id} />}
        {category?.imageUrl && <input type="hidden" name="imageUrl" value={category.imageUrl} />}
        <div>
          <label className="label">Emri</label>
          <input name="name" defaultValue={category?.name} required className="field rounded" />
        </div>
        <div className="grid grid-cols-[1fr_80px] gap-3">
          <div>
            <label className="label">Adresa (slug)</label>
            <input name="slug" defaultValue={category?.slug} placeholder="krijohet nga emri" className="field rounded font-mono text-xs" />
          </div>
          <div>
            <label className="label">Renditja</label>
            <input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className="field rounded" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Përshkrimi</label>
          <input name="description" defaultValue={category?.description} className="field rounded" />
        </div>
        <div>
          <label className="label">Foto e kategorisë</label>
          <input name="image" type="file" accept="image/*" className="text-sm" />
        </div>
        <div className="flex items-end justify-end gap-3">
          {category && (
            <span className="mr-auto self-center text-xs text-muted">{productCount} produkte</span>
          )}
          {category && (
            <ConfirmButton
              formAction={deleteCategory}
              message={`Ta fshij kategorinë "${category.name}"? Produktet mbeten, por pa kategori.`}
              className="text-sm text-danger hover:underline"
            >
              Fshij
            </ConfirmButton>
          )}
          <button className="btn btn-primary !min-h-10 rounded !px-5 !text-xs">{category ? "Ruaj" : "Shto"}</button>
        </div>
      </form>
    </div>
  );
}
