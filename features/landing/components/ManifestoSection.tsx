import { SectionLabel } from "@/shared/ui";

export function ManifestoSection() {
  return (
    <section className="manifesto" id="about">
      <SectionLabel kind="section-kicker">
        UNA NUEVA FORMA DE ENTRAR AL MUNDO DEL PERFUME
      </SectionLabel>
      <h2>
        No elegimos por vos.
        <br />
        <em>Te ayudamos a descubrir.</em>
      </h2>
      <div className="manifesto-grid">
        <p>
          NO.23 nace para transformar la compra de perfume en una experiencia de
          exploración. Menos impulso. Más criterio. Más identidad.
        </p>
        <p>
          Una plataforma donde podés aprender, probar, registrar tu colección y
          desarrollar un perfil olfativo cada vez más preciso.
        </p>
      </div>
    </section>
  );
}
