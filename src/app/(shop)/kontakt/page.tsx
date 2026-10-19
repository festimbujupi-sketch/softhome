import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-button";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Kontakt" };

export default async function ContactPage() {
  const s = await getSettings();
  const items = [
    { icon: <Phone size={22} strokeWidth={1.25} />, label: "Telefoni", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: <WhatsAppIcon size={22} />, label: "WhatsApp", value: "Na shkruani", href: `https://wa.me/${s.whatsapp}` },
    { icon: <Mail size={22} strokeWidth={1.25} />, label: "Email", value: s.email, href: `mailto:${s.email}` },
    { icon: <MapPin size={22} strokeWidth={1.25} />, label: "Adresa", value: s.address },
    { icon: <Clock size={22} strokeWidth={1.25} />, label: "Orari", value: s.openingHours },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="eyebrow">Kontakt</p>
        <h1 className="mt-4 text-4xl font-light sm:text-5xl">Jemi këtu për ju</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">Pyetje për një produkt apo për porosinë? Na kontaktoni në cilëndo mënyrë.</p>
      </div>
      <ul className="mt-12 divide-y divide-line border-y border-line">
        {items.map((item) => {
          const content = (
            <>
              <span className="text-clay">{item.icon}</span>
              <span className="w-28 shrink-0 text-sm text-muted">{item.label}</span>
              <span>{item.value}</span>
            </>
          );
          return (
            <li key={item.label}>
              {item.href ? (
                <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-5 py-5 hover:text-clay">
                  {content}
                </a>
              ) : (
                <div className="flex items-center gap-5 py-5">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
