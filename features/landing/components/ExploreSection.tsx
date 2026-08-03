import { SectionLabel, TextLink } from "@/shared/ui";
import { EditorialCard } from "./EditorialCard";

export function ExploreSection() {
  return (
    <section className="explore-section" id="explore">
      <div className="explore-copy">
        <SectionLabel kind="section-kicker">EXPLORE</SectionLabel>
        <h2>Una biblioteca para entender el perfume.</h2>
        <p>
          Casas, perfumistas, notas, familias y fragancias. Todo conectado para
          que una búsqueda se convierta en muchas nuevas puertas.
        </p>
        <TextLink href="#newsletter" className="dark-link">
          Explorar la biblioteca ↗
        </TextLink>
      </div>
      <div className="editorial-grid">
        <EditorialCard
          large
          artClassName="iris-art"
          artLabel="IRIS"
          meta="NOTA / 01"
          title="Iris: polvo, elegancia y textura."
        />
        <EditorialCard
          artClassName="mineral-art"
          artLabel="MINERAL"
          meta="FAMILIA / 04"
          title="La nueva mineralidad."
        />
        <EditorialCard
          artClassName="perfumer-art"
          artLabel="Q.B."
          meta="PERFUMISTA / 12"
          title="Quentin Bisch."
        />
      </div>
    </section>
  );
}
