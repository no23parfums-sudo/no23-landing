import type { Metadata } from "next";
import { manrope, playfair } from "@/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NO.23 — El perfume empieza con el descubrimiento",
  description:
    "NO.23 — Descubrí perfumes, construí tu colección y desarrollá tu identidad olfativa.",
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
