import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Soft Home — Tekstile për shtëpinë",
    template: "%s · Soft Home",
  },
  description:
    "Peshqirë, çarçafë, sete jorgani dhe sete banjoje. Pagesë në dorëzim kudo në Kosovë.",
};

// Content comes from the CMS, so pages always render fresh data.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq">
      <body className={`${jost.variable} font-sans font-light antialiased`}>{children}</body>
    </html>
  );
}
