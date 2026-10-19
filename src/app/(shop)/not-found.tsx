import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl font-light">Faqja nuk u gjet</h1>
      <p className="mt-4 text-muted">Ndoshta produkti është hequr ose adresa është shkruar gabim.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Kthehu në kreu
      </Link>
    </div>
  );
}
