import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductView } from "@/components/product-view";
import { ProductGrid } from "@/components/product-card";
import { getProductBySlug, getProductCards } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProductBySlug((await params).slug);
  if (!data) return {};
  return {
    title: data.product.name,
    description: data.product.description.slice(0, 160),
    openGraph: { images: data.images[0] ? [data.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [data, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!data) notFound();
  const { product, images, variants, category } = data;

  const related = category
    ? (await getProductCards({ categoryId: category.id })).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <nav className="py-6 text-xs uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="hover:text-ink">Kreu</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/kategoria/${category.slug}`} className="hover:text-ink">{category.name}</Link>
          </>
        )}
      </nav>

      <ProductView
        product={product}
        images={images.map(({ id, url, alt }) => ({ id, url, alt }))}
        variants={variants.map(({ id, name, price, stock, colorHex, imageId }) => ({ id, name, price, stock, colorHex, imageId }))}
        whatsapp={settings.whatsapp}
      />

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-2xl font-light sm:text-3xl">Mund t&apos;ju pëlqejnë edhe</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
