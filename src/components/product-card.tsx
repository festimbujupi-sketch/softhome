import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/queries";
import { discountPercent, formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: ProductCardData }) {
  const fromPrice = product.variantCount > 1 && product.minPrice < product.price;
  const discount = discountPercent(product.price, product.compareAtPrice);
  return (
    <Link href={`/produkti/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-all duration-700 group-hover:scale-[1.03] ${
              product.hoverImage ? "group-hover:opacity-0" : ""
            }`}
          />
        )}
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {!product.inStock && (
            <span className="bg-white/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em]">E shitur</span>
          )}
          {product.inStock && discount > 0 && (
            <span className="bg-clay px-2 py-1 text-[11px] tracking-[0.08em] text-white">-{discount}%</span>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-[15px] font-normal leading-snug">{product.name}</h3>
        <p className="text-sm">
          {fromPrice && <span className="text-muted">nga </span>}
          {formatPrice(product.minPrice)}
          {discount > 0 && (
            <span className="ml-2 text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>
          )}
        </p>
        {product.swatches.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.swatches.slice(0, 7).map((s) => (
              <span
                key={s.name}
                title={s.name}
                className="h-3 w-3 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: s.hex }}
              />
            ))}
            {product.swatches.length > 7 && (
              <span className="text-xs text-muted">+{product.swatches.length - 7}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-muted">Nuk ka produkte për momentin.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
