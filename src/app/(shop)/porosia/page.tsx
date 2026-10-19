import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getSettings } from "@/lib/settings";
import { kosovoCities } from "@/lib/cities";

export const metadata: Metadata = { title: "Porosia" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-4xl font-light">Përfundo porosinë</h1>
      <p className="mt-3 text-muted">Pagesa bëhet në dorëzim. Nuk ju kërkohet asnjë kartelë.</p>
      <CheckoutForm
        cities={kosovoCities}
        deliveryFee={settings.deliveryFee}
        freeDeliveryFrom={settings.freeDeliveryFrom}
        deliveryTime={settings.deliveryTime}
        hasWhatsapp={Boolean(settings.whatsapp)}
      />
    </div>
  );
}
