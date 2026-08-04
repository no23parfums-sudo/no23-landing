import type { Metadata } from "next";
import { BibliotecaPage } from "@/features/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Biblioteca — NO.23",
  description:
    "Biblioteca olfativa de NO.23. Fichas de perfume construidas desde el diccionario operativo.",
  alternates: {
    canonical: "/biblioteca",
  },
};

export default function Page() {
  return <BibliotecaPage />;
}
