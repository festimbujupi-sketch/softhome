import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { CircleCheck } from "lucide-react";
import { db, schema } from "@/db";
import { formatPrice } from "@/lib/format";
import { WhatsAppContinue } from "@/components/whatsapp-continue";

export const metadata = { title: "Faleminderit" };

export default async function OrderSuccessPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.number, number));
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <CircleCheck size={48} strokeWidth={1} className="mx-auto text-sage" />
      <h1 className="mt-6 text-4xl font-light">Faleminderit!</h1>
      <p className="mt-4 text-muted">
        Porosia juaj <strong className="font-normal text-ink">{order.number}</strong> u regjistrua. Totali për t&apos;u
        paguar në dorëzim: <strong className="font-normal text-ink">{formatPrice(order.total)}</strong>.
      </p>
      {order.channel === "whatsapp" ? (
        <WhatsAppContinue />
      ) : (
        <p className="mt-4 text-muted">Do t&apos;ju telefonojmë së shpejti për ta konfirmuar porosinë.</p>
      )}
      <Link href="/produktet" className="btn btn-outline mt-10">
        Vazhdo blerjet
      </Link>
    </div>
  );
}
