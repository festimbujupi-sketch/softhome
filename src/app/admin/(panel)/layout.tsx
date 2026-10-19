import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/nav";
import { logout } from "../actions";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: { default: "Paneli", template: "%s · Paneli Soft Home" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f4f2ee] font-normal md:flex">
      <aside className="border-b border-line bg-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block md:py-6">
          <Link href="/admin">
            <Image src="/brand/logo-black.png" alt="Soft Home" width={140} height={15} className="h-4 w-auto" />
          </Link>
          <p className="hidden text-[10px] uppercase tracking-[0.18em] text-muted md:mt-2 md:block">Paneli</p>
        </div>
        <AdminNav />
        <div className="hidden space-y-1 border-t border-line p-3 text-sm md:mt-auto md:block">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded px-3 py-2 text-muted hover:bg-sand/60">
            <ExternalLink size={16} /> Shiko dyqanin
          </Link>
          <form action={logout}>
            <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-muted hover:bg-sand/60">
              <LogOut size={16} /> Dil
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
