import { SectionLabel, TextLink } from "@/shared/ui";
import { KitCard } from "./KitCard";

export function KitsSection() {
  return (
    <section className="kits-section" id="kits">
      <div className="section-heading kits-heading">
        <div>
          <SectionLabel kind="section-kicker">KITS NO.23</SectionLabel>
          <h2>
            Experiencias curadas.
            <br />
            No simples muestras.
          </h2>
        </div>
        <TextLink href="#newsletter" className="dark-link">
          Ver próximos kits ↗
        </TextLink>
      </div>
      <div className="kit-grid">
        <KitCard
          variant="kit-one"
          number="01"
          vialCount={3}
          category="INTRODUCCIÓN AL NICHO"
          title="First Steps"
          description="Una selección para entrar al universo de la perfumería de autor."
        />
        <KitCard
          variant="kit-two"
          number="02"
          vialCount={5}
          category="CONTRASTES"
          title="Light / Shadow"
          description="Cinco perfumes, dos extremos y una misma identidad por descubrir."
        />
      </div>
    </section>
  );
}
