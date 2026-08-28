export const MEDIA = {
  hero: "/media/bibliotheque/hero-boutique.jpg",
  mark: "/media/bibliotheque/no23-mark.png",
  vol01: "/media/bibliotheque/vol-01.jpg",
  vol02: "/media/bibliotheque/vol-02.jpg",
  vol03: "/media/bibliotheque/vol-03.jpg",
  vol04: "/media/bibliotheque/vol-04.jpg",
} as const;

export const VOLUMES = [
  {
    n: "I",
    title: "Cristal Dormant",
    family: "Ambre — Iris — Cire",
    year: "1912",
    image: MEDIA.vol01,
    note: "Trois gouttes retrouvées dans un cabinet du Marais.",
  },
  {
    n: "II",
    title: "Officine Rouge",
    family: "Rose fanée — Résine — Cuir",
    year: "1897",
    image: MEDIA.vol02,
    note: "Formule d'apothicaire, recopiée à la main, jamais éditée.",
  },
  {
    n: "III",
    title: "Le Registre",
    family: "Cuir noir — Encre — Tabac",
    year: "1901",
    image: MEDIA.vol03,
    note: "L'odeur exacte des reliures que personne n'ouvre plus.",
  },
  {
    n: "IV",
    title: "Fumée Tardive",
    family: "Encens — Bois brûlé — Air",
    year: "1934",
    image: MEDIA.vol04,
    note: "Ce qui reste dans la pièce une heure après le départ.",
  },
] as const;

export const ENTRIES = [
  { ref: "NO.23 — A/01", name: "Ambarados", count: "38 perfumes", href: "#vitrine" },
  { ref: "NO.23 — B/02", name: "Florales", count: "51 perfumes", href: "#vitrine" },
  { ref: "NO.23 — C/03", name: "Amaderados", count: "64 perfumes", href: "#vitrine" },
  { ref: "NO.23 — D/04", name: "Aromáticos", count: "42 perfumes", href: "#vitrine" },
  { ref: "NO.23 — E/05", name: "Cítricos", count: "29 perfumes", href: "#vitrine" },
  { ref: "NO.23 — F/06", name: "Cuero", count: "17 perfumes", href: "#vitrine" },
  { ref: "NO.23 — G/07", name: "Gourmand", count: "33 perfumes", href: "#vitrine" },
] as const;
