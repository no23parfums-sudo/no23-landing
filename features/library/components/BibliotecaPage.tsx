import { LibraryShell } from "./LibraryShell";
import { PerfumeList } from "./PerfumeList";
import { listPerfumes } from "../lib/queries";

export async function BibliotecaPage() {
  const items = await listPerfumes();

  return (
    <LibraryShell>
      <section className="library-hero">
        <p className="section-kicker">Biblioteca</p>
        <h1>
          El archivo olfativo
          <br />
          <em>de NO.23</em>
        </h1>
        <p className="section-intro library-intro">
          Fichas verificables, construidas desde el diccionario operativo. Solo
          mostramos lo que ya está cargado.
        </p>
      </section>
      <section className="library-catalog" aria-label="Catálogo">
        <PerfumeList items={items} />
      </section>
    </LibraryShell>
  );
}
