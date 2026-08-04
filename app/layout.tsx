import type { Metadata } from "next";
import { manrope, playfair } from "@/styles/fonts";
import "./globals.css";

const siteUrl = "https://no23.com.ar";
const title = "NO.23 — El perfume empieza con el descubrimiento";
const description =
  "NO.23 — Descubrí perfumes, construí tu colección y desarrollá tu identidad olfativa.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "NO.23",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${playfair.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
