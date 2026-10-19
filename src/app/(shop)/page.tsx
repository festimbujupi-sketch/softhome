import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { ProductGrid } from "@/components/product-card";
import { getCategories, getProductCards } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, categories, featured] = await Promise.all([
    getSettings(),
    getCategories(),
    getProductCards({ featured: true }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1fr_1.1fr] md:gap-16 md:pt-16">
        <div className="order-2 md:order-1">
          <p className="eyebrow">Tekstile për shtëpinë</p>
          <h1 className="mt-5 text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{settings.heroSubtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/produktet" className="btn btn-primary">
              Bli tani <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <Link href="/kategoria/peshqire" className="btn btn-outline">
              Peshqirët
            </Link>
          </div>
        </div>
        <div className="relative order-1 aspect-[4/5] overflow-hidden bg-sand md:order-2">
          <Image
            src="/products/carcafe/kategoria.webp"
            alt="Shtrat me set çarçafësh në blu qielli"
            fill
            priority
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Promises */}
      <section className="border-y border-line bg-sand/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { icon: Banknote, title: "Pagesë në dorëzim", text: "Paguani kur ta merrni porosinë" },
            { icon: Truck, title: "Dërgesë e shpejtë", text: `${settings.deliveryTime} në gjithë Kosovën` },
            { icon: ShieldCheck, title: "Cilësi e kontrolluar", text: "Çdo produkt kontrollohet para dërgesës" },
            { icon: MessageCircle, title: "Porosi me WhatsApp", text: "Na shkruani, ju përgjigjemi shpejt" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center px-2 text-center">
              <Icon size={26} strokeWidth={1} className="text-clay" />
              <p className="mt-3 text-sm font-normal">{title}</p>
              <p className="mt-1 text-xs text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Kategoritë</p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">Gjeni atë që i duhet shtëpisë</h2>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/kategoria/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-sand sm:aspect-[5/4]">
              {c.imageUrl && (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white sm:p-6">
                <h3 className="text-lg font-normal tracking-wide sm:text-2xl sm:font-light">{c.name}</h3>
                <ArrowRight size={20} strokeWidth={1.25} className="hidden transition-transform group-hover:translate-x-1 sm:block" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Të preferuarat</p>
              <h2 className="mt-3 text-3xl font-light sm:text-4xl">Më të kërkuarat</h2>
            </div>
            <Link href="/produktet" className="hidden text-sm uppercase tracking-[0.12em] underline-offset-4 hover:underline sm:block">
              Shiko të gjitha
            </Link>
          </div>
          <ProductGrid products={featured.slice(0, 8)} />
        </section>
      )}

      {/* Story */}
      <section className="mx-auto mt-24 grid max-w-7xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <Image
            src="/products/peshqire/peshqir-pambuku-3.webp"
            alt="Peshqirë blu të palosur mbi një stol druri"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow">Rreth nesh</p>
          <h2 className="mt-3 text-3xl font-light leading-tight sm:text-4xl">E bërë për përditshmërinë tuaj</h2>
          <div className="prose-shop mt-6 max-w-md leading-relaxed text-muted">
            {settings.aboutText.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link href="/rreth-nesh" className="btn btn-outline mt-8">
            Njihuni me ne
          </Link>
        </div>
      </section>
    </>
  );
}
