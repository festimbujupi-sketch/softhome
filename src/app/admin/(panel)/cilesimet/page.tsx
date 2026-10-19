import { Card, PageHeader } from "@/components/admin/ui";
import { centsToInput } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { updateSettings } from "../../actions";

export const metadata = { title: "Cilësimet" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ruajtur?: string }> }) {
  const [s, { ruajtur }] = await Promise.all([getSettings(), searchParams]);

  return (
    <form action={updateSettings} className="max-w-3xl space-y-6 pb-10">
      <PageHeader title="Cilësimet">
        {ruajtur && <span className="self-center text-sm text-emerald-700">U ruajt ✓</span>}
        <button className="btn btn-primary !min-h-10 rounded">Ruaj</button>
      </PageHeader>

      <Section title="Kontakti">
        <Field name="whatsapp" label="Numri i WhatsApp (me prefiks, p.sh. 38344123456)" defaultValue={s.whatsapp} />
        <Field name="phone" label="Telefoni (siç shfaqet)" defaultValue={s.phone} />
        <Field name="email" label="Email publik" defaultValue={s.email} type="email" />
        <Field name="orderNotifyEmail" label="Email për njoftim porosish" defaultValue={s.orderNotifyEmail} type="email" />
        <Field name="address" label="Adresa" defaultValue={s.address} />
        <Field name="openingHours" label="Orari" defaultValue={s.openingHours} />
        <Field name="instagram" label="Instagram (link)" defaultValue={s.instagram} />
        <Field name="facebook" label="Facebook (link)" defaultValue={s.facebook} />
      </Section>

      <Section title="Dërgesa">
        <Field name="deliveryFee" label="Çmimi i dërgesës (€)" defaultValue={centsToInput(s.deliveryFee)} inputMode="decimal" />
        <Field name="freeDeliveryFrom" label="Dërgesë falas mbi (€, 0 = kurrë)" defaultValue={centsToInput(s.freeDeliveryFrom)} inputMode="decimal" />
        <Field name="deliveryTime" label="Koha e dërgesës" defaultValue={s.deliveryTime} />
      </Section>

      <Section title="Tekstet e faqes">
        <Field name="shopName" label="Emri i dyqanit" defaultValue={s.shopName} />
        <Field name="tagline" label="Slogani" defaultValue={s.tagline} />
        <Field name="heroTitle" label="Titulli kryesor (faqja e parë)" defaultValue={s.heroTitle} wide />
        <TextArea name="heroSubtitle" label="Nëntitulli (faqja e parë)" defaultValue={s.heroSubtitle} rows={2} />
        <TextArea name="aboutText" label="Rreth nesh (lini rresht bosh për paragraf të ri)" defaultValue={s.aboutText} rows={6} />
      </Section>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

function Field({ label, wide, ...props }: { label: string; wide?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="label" htmlFor={props.name}>{label}</label>
      <input id={props.name} className="field rounded" {...props} />
    </div>
  );
}

function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="sm:col-span-2">
      <label className="label" htmlFor={props.name}>{label}</label>
      <textarea id={props.name} className="field rounded" {...props} />
    </div>
  );
}
