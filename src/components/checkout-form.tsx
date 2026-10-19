"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Banknote } from "lucide-react";
import { useCart } from "./cart";
import { WhatsAppIcon } from "./whatsapp-button";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "@/app/actions/order";

export function CheckoutForm({
  cities,
  deliveryFee,
  freeDeliveryFrom,
  deliveryTime,
  hasWhatsapp,
}: {
  cities: string[];
  deliveryFee: number;
  freeDeliveryFrom: number;
  deliveryTime: string;
  hasWhatsapp: boolean;
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [channel, setChannel] = useState<"cod" | "whatsapp">("cod");

  const delivery = freeDeliveryFrom > 0 && subtotal >= freeDeliveryFrom ? 0 : deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mt-12 border border-line bg-white/50 p-10 text-center">
        <p className="text-muted">Shporta juaj është bosh.</p>
        <Link href="/produktet" className="btn btn-outline mt-6">
          Shiko produktet
        </Link>
      </div>
    );
  }

  function onSubmit(formData: FormData) {
    setError("");
    setFieldErrors({});
    startTransition(async () => {
      const result = await placeOrder({
        customerName: String(formData.get("customerName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        city: String(formData.get("city") ?? ""),
        address: String(formData.get("address") ?? ""),
        note: String(formData.get("note") ?? ""),
        channel,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      try {
        if (result.whatsappUrl) sessionStorage.setItem("softhome-wa", result.whatsappUrl);
      } catch {}
      clear();
      router.push(`/porosia/sukses/${result.number}`);
    });
  }

  return (
    <form action={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="eyebrow mb-4">Të dhënat e dërgesës</legend>
          <Field name="customerName" label="Emri dhe mbiemri" autoComplete="name" error={fieldErrors.customerName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="phone" label="Telefoni" type="tel" autoComplete="tel" placeholder="+383 4x xxx xxx" error={fieldErrors.phone} />
            <Field name="email" label="Email (opsionale)" type="email" autoComplete="email" required={false} error={fieldErrors.email} />
          </div>
          <div>
            <label className="label" htmlFor="city">Qyteti</label>
            <select id="city" name="city" required className="field" defaultValue="">
              <option value="" disabled>Zgjidhni qytetin</option>
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.city && <p className="mt-1 text-sm text-danger">{fieldErrors.city}</p>}
          </div>
          <Field name="address" label="Adresa (rruga, numri, fshati/lagjja)" autoComplete="street-address" error={fieldErrors.address} />
          <div>
            <label className="label" htmlFor="note">Shënim për porosinë (opsionale)</label>
            <textarea id="note" name="note" rows={3} className="field" maxLength={500} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-4">Si dëshironi ta porositni?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChannelOption
              active={channel === "cod"}
              onSelect={() => setChannel("cod")}
              icon={<Banknote size={22} strokeWidth={1.25} />}
              title="Pagesë në dorëzim"
              text="Ne ju telefonojmë për konfirmim dhe paguani kur ta merrni."
            />
            {hasWhatsapp && (
              <ChannelOption
                active={channel === "whatsapp"}
                onSelect={() => setChannel("whatsapp")}
                icon={<WhatsAppIcon size={22} />}
                title="Porosi me WhatsApp"
                text="Porosia dërgohet si mesazh në WhatsApp. Pagesa në dorëzim."
              />
            )}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit border border-line bg-white/60 p-6 lg:sticky lg:top-28">
        <h2 className="eyebrow">Porosia juaj</h2>
        <ul className="mt-5 divide-y divide-line">
          {items.map((i) => (
            <li key={i.variantId} className="flex gap-3 py-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-sand">
                {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
                <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center bg-ink px-1 text-[11px] text-white">
                  {i.quantity}
                </span>
              </div>
              <div className="flex-1 text-sm">
                <p>{i.name}</p>
                {i.showVariant && <p className="text-xs text-muted">{i.variantName}</p>}
              </div>
              <p className="text-sm">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Nëntotali</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Dërgesa ({deliveryTime})</dt>
            <dd>{delivery ? formatPrice(delivery) : "Falas"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt>Totali</dt>
            <dd className="font-normal">{formatPrice(subtotal + delivery)}</dd>
          </div>
        </dl>
        {error && <p className="mt-4 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className={`btn mt-6 w-full ${channel === "whatsapp" ? "btn-whatsapp" : "btn-primary"}`}
        >
          {pending ? "Duke dërguar…" : channel === "whatsapp" ? "Vazhdo në WhatsApp" : "Konfirmo porosinë"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">Paguani me para në dorë kur ta merrni porosinë.</p>
      </aside>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  required = true,
  ...props
}: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} required={required} className="field" {...props} />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

function ChannelOption({
  active,
  onSelect,
  icon,
  title,
  text,
}: {
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex gap-3 border p-4 text-left transition ${
        active ? "border-ink bg-white" : "border-stone hover:border-ink/50"
      }`}
    >
      <span className={active ? "text-clay" : "text-muted"}>{icon}</span>
      <span>
        <span className="block text-sm font-normal">{title}</span>
        <span className="mt-1 block text-xs text-muted">{text}</span>
      </span>
    </button>
  );
}
