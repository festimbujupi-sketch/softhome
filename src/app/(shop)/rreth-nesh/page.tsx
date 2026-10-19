import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Rreth nesh" };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="pb-12 pt-16 text-center">
        <p className="eyebrow">Rreth nesh</p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-light leading-tight sm:text-5xl">{settings.tagline}</h1>
      </div>
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <Image src="/products/sete-jorgani/kategoria.webp" alt="Set jorgani i bardhë" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="prose-shop max-w-md text-lg leading-relaxed text-muted">
          {settings.aboutText.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <Link href="/produktet" className="btn btn-primary mt-8">
            Shiko koleksionin
          </Link>
        </div>
      </div>
    </div>
  );
}
