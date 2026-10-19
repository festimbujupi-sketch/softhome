import Image from "next/image";
import Link from "next/link";
import type { ShopSettings } from "@/lib/settings";

export function Footer({ settings, categories }: { settings: ShopSettings; categories: { slug: string; name: string }[] }) {
  return (
    <footer className="mt-24 bg-ink text-linen">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Image src="/brand/logo-white.png" alt="Soft Home" width={180} height={19} className="h-5 w-auto" />
          <p className="mt-5 max-w-xs text-sm text-linen/60">{settings.tagline}</p>
        </div>
        <div>
          <h3 className="eyebrow !text-linen/50">Kategoritë</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/kategoria/${c.slug}`} className="text-linen/80 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="eyebrow !text-linen/50">Soft Home</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/rreth-nesh" className="text-linen/80 hover:text-white">
                Rreth nesh
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="text-linen/80 hover:text-white">
                Kontakt
              </Link>
            </li>
            <li>
              <Link href="/kushtet" className="text-linen/80 hover:text-white">
                Dërgesa dhe kthimet
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow !text-linen/50">Na kontaktoni</h3>
          <ul className="mt-4 space-y-2 text-sm text-linen/80">
            <li>{settings.address}</li>
            <li>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
            <li className="flex gap-4 pt-2">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-white">
                  Facebook
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-linen/40 sm:px-6">
          © {new Date().getFullYear()} {settings.shopName}. Të gjitha të drejtat e rezervuara.
        </p>
      </div>
    </footer>
  );
}
