import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond } from "next/font/google";
import "@/styles/bibliotheque.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--be-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NO.23 — Bibliothèque",
  description:
    "Un archivo vivo de perfumería. Explorá perfumes, materias, perfumistas y casas a través de una lectura editorial de NO.23.",
  alternates: {
    canonical: "/bibliotheque",
  },
};

export default function BibliothequeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`be ${display.variable}`}>
      {children}
    </div>
  );
}
