import { Button, SectionLabel } from "@/shared/ui";
import { ChoiceGrid } from "./ChoiceGrid";

export function DiscoverySection() {
  return (
    <section className="discovery-section" id="discover">
      <div className="section-heading">
        <div>
          <SectionLabel kind="section-kicker">DISCOVERY</SectionLabel>
          <h2>
            Tu próxima fragancia
            <br />
            no debería ser una apuesta.
          </h2>
        </div>
        <p className="section-intro">
          Respondé algunas preguntas y recibí una selección curada según tus
          gustos, tu colección y el momento que querés vivir.
        </p>
      </div>
      <div className="discovery-stage">
        <div className="discovery-card">
          <span className="step-number">01</span>
          <div>
            <SectionLabel kind="mini-label">TU PUNTO DE PARTIDA</SectionLabel>
            <h3>¿Qué querés sentir?</h3>
          </div>
          <ChoiceGrid />
          <Button variant="light" href="#newsletter">
            Comenzar Discovery
          </Button>
        </div>
        <div className="discovery-note">
          <span>NO.23 / INTELLIGENCE</span>
          <p>
            Cada respuesta suma una señal. Cada interacción mejora la próxima
            recomendación.
          </p>
        </div>
      </div>
    </section>
  );
}
