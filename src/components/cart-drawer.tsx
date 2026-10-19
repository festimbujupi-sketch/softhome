"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "./cart";
import { formatPrice } from "@/lib/format";

export function CartDrawer({ deliveryFee, freeDeliveryFrom }: { deliveryFee: number; freeDeliveryFrom: number }) {
  const { items, open, setOpen, subtotal, update, remove } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const missing = freeDeliveryFrom > 0 ? freeDeliveryFrom - subtotal : 0;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-linen shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shporta"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-lg tracking-wide">Shporta</h2>
          <button onClick={() => setOpen(false)} aria-label="Mbyll shportën" className="p-1">
            <X size={22} strokeWidth={1.25} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted">Shporta juaj është bosh.</p>
            <Link href="/produktet" className="btn btn-outline" onClick={() => setOpen(false)}>
              Shiko produktet
            </Link>
          </div>
        ) : (
          <>
            {freeDeliveryFrom > 0 && (
              <div className="border-b border-line bg-sand px-6 py-3 text-sm">
                {missing > 0 ? (
                  <>
                    Edhe <strong className="font-medium">{formatPrice(missing)}</strong> për dërgesë falas
                  </>
                ) : (
                  <>Dërgesa juaj është falas</>
                )}
              </div>
            )}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link
                    href={`/produkti/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand"
                  >
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-sm font-normal">{item.name}</p>
                        {item.showVariant && <p className="text-xs text-muted">{item.variantName}</p>}
                      </div>
                      <button onClick={() => remove(item.variantId)} aria-label="Hiq" className="self-start text-muted">
                        <X size={16} strokeWidth={1.25} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <QuantityControl
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(q) => update(item.variantId, q)}
                      />
                      <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-line px-6 py-6">
              <div className="flex justify-between">
                <span>Nëntotali</span>
                <span className="font-normal">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted">
                Dërgesa: {freeDeliveryFrom > 0 && subtotal >= freeDeliveryFrom ? "falas" : formatPrice(deliveryFee)} ·
                Pagesa bëhet në dorëzim
              </p>
              <Link href="/porosia" className="btn btn-primary w-full" onClick={() => setOpen(false)}>
                Vazhdo me porosinë
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function QuantityControl({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center border border-stone">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center disabled:opacity-30"
        onClick={() => onChange(value - 1)}
        aria-label="Zvogëlo sasinë"
        disabled={value <= 1}
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm">{value}</span>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        aria-label="Rrit sasinë"
        disabled={value >= max}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
