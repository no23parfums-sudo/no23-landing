"use client";

import { Chrome } from "./Chrome";
import { Hero } from "./Hero";
import { Manifesto } from "./Manifesto";
import { Vitrine } from "./Vitrine";
import { Registre } from "./Registre";
import { Salon } from "./Salon";
import { useBibliothequeScroll } from "./useBibliothequeScroll";

export function BibliothequePage() {
  useBibliothequeScroll();

  return (
    <main className="relative bg-background">
      <Chrome />
      <Hero />
      <Manifesto />
      <Vitrine />
      <Registre />
      <Salon />
    </main>
  );
}
