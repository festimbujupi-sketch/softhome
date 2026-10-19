"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutDashboard, Package, Settings, ShoppingCart } from "lucide-react";

const links = [
  { href: "/admin", label: "Përmbledhja", icon: LayoutDashboard, exact: true },
  { href: "/admin/porosite", label: "Porositë", icon: ShoppingCart },
  { href: "/admin/produktet", label: "Produktet", icon: Package },
  { href: "/admin/kategorite", label: "Kategoritë", icon: FolderTree },
  { href: "/admin/cilesimet", label: "Cilësimet", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm md:flex-col md:pb-0">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2.5 rounded px-3 py-2 ${
              active ? "bg-ink text-white" : "text-ink/80 hover:bg-sand/60"
            }`}
          >
            <Icon size={17} strokeWidth={1.5} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
