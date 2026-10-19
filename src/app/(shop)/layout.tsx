import { CartProvider } from "@/components/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const nav = categories.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <CartProvider>
      <div className="bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-[0.16em] text-linen/90">
        Pagesë në dorëzim · Dërgesë në gjithë Kosovën
        {settings.freeDeliveryFrom > 0 && ` · Falas mbi ${settings.freeDeliveryFrom / 100} €`}
      </div>
      <Header categories={nav} />
      <main>{children}</main>
      <Footer settings={settings} categories={nav} />
      <CartDrawer deliveryFee={settings.deliveryFee} freeDeliveryFrom={settings.freeDeliveryFrom} />
      <WhatsAppButton number={settings.whatsapp} />
    </CartProvider>
  );
}
