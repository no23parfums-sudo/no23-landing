import { Button, SectionLabel, TextLink } from "@/shared/ui";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-visual">
        <div className="halo halo-one"></div>
        <div className="halo halo-two"></div>
        <div className="bottle bottle-back">
          <span className="bottle-cap"></span>
          <span className="bottle-label">
            NO.23
            <br />
            <small>OLFACTORY STUDY</small>
          </span>
        </div>
        <div className="bottle bottle-front">
          <span className="bottle-cap"></span>
          <span className="bottle-label">
            NO.23
            <br />
            <small>DISCOVERY 01</small>
          </span>
        </div>
        <div className="hero-grain"></div>
      </div>
      <div className="hero-content">
        <SectionLabel kind="eyebrow">
          CURADURÍA · DESCUBRIMIENTO · IDENTIDAD
        </SectionLabel>
        <h1>
          El perfume empieza
          <br />
          con el descubrimiento.
        </h1>
        <p className="hero-copy">
          Probá antes de elegir. Entendé lo que te gusta. Construí una colección
          que realmente hable de vos.
        </p>
        <div className="hero-ctas">
          <Button variant="dark" href="#discover">
            Descubrir mi próximo perfume
          </Button>
          <TextLink href="#collection">Crear mi colección ↗</TextLink>
        </div>
      </div>
      <div className="hero-index">01 — 04</div>
    </section>
  );
}
