"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "./cart";

type NavCategory = { slug: string; name: string };

export function Header({ categories }: { categories: NavCategory[] }) {
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-linen/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6">
        <button className="-ml-1 p-1 xl:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menyja">
          {menuOpen ? <X size={24} strokeWidth={1.25} /> : <Menu size={24} strokeWidth={1.25} />}
        </button>

        <Link href="/" className="shrink-0" aria-label="Soft Home – kreu">
          <Image src="/brand/logo-black.png" alt="Soft Home" width={180} height={19} priority className="h-4 w-auto sm:h-5" />
        </Link>

        <nav className="hidden items-center gap-6 whitespace-nowrap text-[13px] uppercase tracking-[0.12em] xl:flex">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/kategoria/${c.slug}`}
              className={`transition-colors hover:text-clay ${
                pathname === `/kategoria/${c.slug}` ? "text-clay" : ""
              }`}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <button onClick={() => setOpen(true)} className="relative -mr-1 p-1" aria-label={`Shporta (${count})`}>
          <ShoppingBag size={22} strokeWidth={1.25} />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-normal text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-linen px-4 pb-6 pt-2 xl:hidden">
          <Link href="/produktet" className="block py-3 text-sm uppercase tracking-[0.12em]">
            Të gjitha produktet
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/kategoria/${c.slug}`} className="block py-3 text-sm uppercase tracking-[0.12em]">
              {c.name}
            </Link>
          ))}
          <div className="mt-2 border-t border-line pt-2">
            <Link href="/rreth-nesh" className="block py-3 text-sm text-muted">
              Rreth nesh
            </Link>
            <Link href="/kontakt" className="block py-3 text-sm text-muted">
              Kontakt
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
