import { Button, SectionLabel } from "@/shared/ui";

export function CollectionSection() {
  return (
    <section className="collection-section" id="collection">
      <div className="collection-dashboard">
        <div className="dash-top">
          <span>MI COLECCIÓN</span>
          <span>24 PERFUMES</span>
        </div>
        <div className="dash-main">
          <div>
            <SectionLabel kind="mini-label">TU PERFIL ACTUAL</SectionLabel>
            <h3>
              Amaderado.
              <br />
              Ámbar.
              <br />
              Con carácter.
            </h3>
          </div>
          <div className="radar-wrap">
            <div className="radar radar-1"></div>
            <div className="radar radar-2"></div>
            <div className="radar radar-3"></div>
            <span className="radar-label l1">FRESCO</span>
            <span className="radar-label l2">DULCE</span>
            <span className="radar-label l3">OSCURO</span>
            <span className="radar-label l4">SECO</span>
          </div>
        </div>
        <div className="dash-bottom">
          <div>
            <strong>32%</strong>
            <span>Amaderados</span>
          </div>
          <div>
            <strong>21%</strong>
            <span>Ámbar</span>
          </div>
          <div>
            <strong>08</strong>
            <span>Casas</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Vacíos detectados</span>
          </div>
        </div>
      </div>
      <div className="collection-copy">
        <SectionLabel kind="section-kicker">MI COLECCIÓN</SectionLabel>
        <h2>Nunca viste tu colección de esta manera.</h2>
        <p>
          Registrá perfumes, armá tu wishlist y descubrí patrones, familias
          dominantes, ocasiones, perfumistas recurrentes y nuevos territorios
          por explorar.
        </p>
        <Button variant="outline" href="#newsletter">
          Crear mi colección
        </Button>
        <span className="free-note">GRATUITO · REQUIERE CUENTA</span>
      </div>
    </section>
  );
}
