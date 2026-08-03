import { SectionLabel } from "@/shared/ui";

export function PassportSection() {
  return (
    <section className="passport-section">
      <div className="passport-card">
        <div className="passport-header">
          <div className="passport-brand">NO.23</div>
          <div className="passport-title">
            PASAPORTE
            <br />
            OLFATIVO
          </div>
          <div className="passport-code">ARG / 0023</div>
        </div>
        <div className="passport-body">
          <div className="fingerprint"></div>
          <div className="passport-data">
            <span>ADN OLFATIVO</span>
            <strong>EN CONSTRUCCIÓN</strong>
            <small>Se activa con tu primera experiencia NO.23.</small>
          </div>
        </div>
      </div>
      <div className="passport-copy">
        <SectionLabel kind="section-kicker">PASAPORTE OLFATIVO</SectionLabel>
        <h2>Una identidad que evoluciona con vos.</h2>
        <p>
          Tu colección, tu wishlist, tus respuestas y cada perfume que evaluás
          alimentan un mismo motor. Con el tiempo, NO.23 aprende a conocerte
          mejor.
        </p>
        <div className="passport-points">
          <span>01 — Aprende de cada interacción</span>
          <span>02 — Mejora tus recomendaciones</span>
          <span>03 — Registra tu evolución</span>
        </div>
      </div>
    </section>
  );
}
