import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Dërgesa dhe kthimet" };

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-light">Dërgesa dhe kthimet</h1>
      <div className="mt-10 space-y-10 leading-relaxed text-muted">
        <section>
          <h2 className="eyebrow !text-ink">Dërgesa</h2>
          <p className="mt-3">
            Dërgojmë në të gjitha komunat e Kosovës brenda {s.deliveryTime}. Kostoja e dërgesës është{" "}
            {formatPrice(s.deliveryFee)}
            {s.freeDeliveryFrom > 0 && <>, ndërsa për porositë mbi {formatPrice(s.freeDeliveryFrom)} dërgesa është falas</>}.
          </p>
        </section>
        <section>
          <h2 className="eyebrow !text-ink">Pagesa</h2>
          <p className="mt-3">
            Pagesa bëhet me para në dorë në momentin e dorëzimit. Pas porosisë ju kontaktojmë me telefon ose WhatsApp
            për ta konfirmuar.
          </p>
        </section>
        <section>
          <h2 className="eyebrow !text-ink">Kthimet</h2>
          <p className="mt-3">
            Nëse produkti nuk ju përshtatet, mund ta ktheni brenda 14 ditësh, i papërdorur dhe në paketimin origjinal.
            Na kontaktoni në {s.phone} ose {s.email} për ta organizuar kthimin.
          </p>
        </section>
      </div>
    </div>
  );
}
