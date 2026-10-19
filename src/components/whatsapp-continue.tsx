"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "./whatsapp-button";

export function WhatsAppContinue() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      setUrl(sessionStorage.getItem("softhome-wa"));
    } catch {}
  }, []);

  if (!url) return null;
  return (
    <div className="mt-8 border border-line bg-white/60 p-6">
      <p className="text-sm text-muted">Hapi i fundit: dërgoni mesazhin e porosisë në WhatsApp.</p>
      <a href={url} target="_blank" rel="noreferrer" className="btn btn-whatsapp mt-4 w-full">
        <WhatsAppIcon size={18} /> Dërgo porosinë në WhatsApp
      </a>
    </div>
  );
}
