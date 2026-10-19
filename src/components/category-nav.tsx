import Link from "next/link";

export function CategoryHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-8 pt-12 text-center sm:pt-16">
      <h1 className="text-4xl font-light sm:text-5xl">{title}</h1>
      {description && <p className="mx-auto mt-4 max-w-xl text-muted">{description}</p>}
    </div>
  );
}

export function CategoryTabs({ categories, active }: { categories: { slug: string; name: string }[]; active?: string }) {
  const base = "shrink-0 border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors";
  return (
    <div className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
      <Link href="/produktet" className={`${base} ${!active ? "border-ink bg-ink text-linen" : "border-stone hover:border-ink"}`}>
        Të gjitha
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/kategoria/${c.slug}`}
          className={`${base} ${active === c.slug ? "border-ink bg-ink text-linen" : "border-stone hover:border-ink"}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
