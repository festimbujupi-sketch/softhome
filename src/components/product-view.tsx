"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "./cart";
import { QuantityControl } from "./cart-drawer";
import { WhatsAppIcon } from "./whatsapp-button";
import { discountPercent, formatPrice } from "@/lib/format";

type Img = { id: number; url: string; alt: string };
type Var = { id: number; name: string; price: number | null; stock: number; colorHex: string | null; imageId: number | null };
type Prod = {
  id: number;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  optionLabel: string;
  description: string;
  details: string;
};

export function ProductView({
  product,
  images,
  variants,
  whatsapp,
}: {
  product: Prod;
  images: Img[];
  variants: Var[];
  whatsapp: string;
}) {
  const { add } = useCart();
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id);
  const [imageIndex, setImageIndex] = useState(() => indexOfImage(images, firstAvailable?.imageId));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const price = variant?.price ?? product.price;
  const inStock = (variant?.stock ?? 0) > 0;
  const showPicker = variants.length > 1;
  const image = images[imageIndex] ?? images[0];

  function selectVariant(v: Var) {
    setVariantId(v.id);
    setQuantity(1);
    const idx = indexOfImage(images, v.imageId);
    if (v.imageId) setImageIndex(idx);
  }

  function handleAdd() {
    if (!variant || !inStock) return;
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantName: variant.name,
        showVariant: showPicker,
        price,
        image: images[indexOfImage(images, variant.imageId)]?.url ?? images[0]?.url ?? null,
        maxStock: variant.stock,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const whatsappText = useMemo(() => {
    const variantText = showPicker && variant ? ` (${product.optionLabel}: ${variant.name})` : "";
    return encodeURIComponent(`Përshëndetje! Jam i/e interesuar për: ${product.name}${variantText}.`);
  }, [product, variant, showPicker]);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-14">
      {/* Gallery */}
      <div className="md:sticky md:top-28 md:self-start">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          {image && (
            <Image
              key={image.url}
              src={image.url}
              alt={image.alt || product.name}
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setImageIndex(i)}
                aria-label={`Foto ${i + 1}`}
                className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-sand ring-offset-2 ring-offset-linen sm:w-20 ${
                  i === imageIndex ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="md:pt-4">
        <h1 className="text-3xl font-light leading-tight sm:text-4xl">{product.name}</h1>
        <p className="mt-4 text-xl">
          {formatPrice(price)}
          {discountPercent(price, product.compareAtPrice) > 0 && (
            <>
              <span className="ml-3 text-base text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>
              <span className="ml-3 bg-clay px-2 py-0.5 align-middle text-xs text-white">
                -{discountPercent(price, product.compareAtPrice)}%
              </span>
            </>
          )}
        </p>

        {showPicker && variant && (
          <div className="mt-8">
            <p className="text-sm">
              {product.optionLabel}: <span className="text-muted">{variant.name}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((v) =>
                v.colorHex ? (
                  <button
                    key={v.id}
                    onClick={() => selectVariant(v)}
                    title={v.name + (v.stock <= 0 ? " – e shitur" : "")}
                    aria-label={v.name}
                    className={`relative h-9 w-9 rounded-full ring-offset-2 ring-offset-linen transition ${
                      v.id === variant.id ? "ring-1 ring-ink" : "hover:ring-1 hover:ring-stone"
                    }`}
                  >
                    <span className="absolute inset-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: v.colorHex }} />
                    {v.stock <= 0 && (
                      <span className="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink/60" />
                    )}
                  </button>
                ) : (
                  <button
                    key={v.id}
                    onClick={() => selectVariant(v)}
                    className={`min-w-14 border px-4 py-2 text-sm transition ${
                      v.id === variant.id ? "border-ink bg-ink text-linen" : "border-stone hover:border-ink"
                    } ${v.stock <= 0 ? "text-muted line-through" : ""}`}
                  >
                    {v.name}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {inStock && (
            <QuantityControl value={quantity} max={variant.stock} onChange={(q) => setQuantity(Math.max(1, q))} />
          )}
          <button onClick={handleAdd} disabled={!inStock} className="btn btn-primary min-w-48 flex-1">
            {!inStock ? "E shitur" : added ? (<><Check size={16} /> U shtua</>) : "Shto në shportë"}
          </button>
        </div>
        {inStock && variant.stock <= 5 && (
          <p className="mt-3 text-sm text-clay">Kanë mbetur vetëm {variant.stock} copë</p>
        )}

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp mt-3 w-full"
          >
            <WhatsAppIcon size={18} /> Pyet në WhatsApp
          </a>
        )}

        <ul className="mt-8 space-y-2 border-y border-line py-6 text-sm text-muted">
          <li>✓ Pagesë në dorëzim — paguani kur ta merrni</li>
          <li>✓ Dërgesë në gjithë Kosovën</li>
          <li>✓ Kthim brenda 14 ditësh nëse produkti nuk është përdorur</li>
        </ul>

        <div className="mt-8">
          <h2 className="eyebrow">Përshkrimi</h2>
          <div className="prose-shop mt-3 leading-relaxed text-muted">
            {product.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {product.details && (
          <div className="mt-8">
            <h2 className="eyebrow">Detajet</h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {product.details.split("\n").filter(Boolean).map((line, i) => {
                const [k, ...rest] = line.split(":");
                return rest.length ? (
                  <div key={i} className="flex justify-between gap-6 py-2.5">
                    <dt className="text-muted">{k.trim()}</dt>
                    <dd className="text-right">{rest.join(":").trim()}</dd>
                  </div>
                ) : (
                  <div key={i} className="py-2.5">{line}</div>
                );
              })}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function indexOfImage(images: Img[], imageId: number | null | undefined) {
  if (!imageId) return 0;
  const i = images.findIndex((img) => img.id === imageId);
  return i === -1 ? 0 : i;
}
