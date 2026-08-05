import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand-main">NO.23</span>
        <p>Perfume discovery, collection & identity.</p>
      </div>
      <div className="footer-columns">
        <div>
          <span>PLATAFORMA</span>
          <a href="#discover">Discovery</a>
          <Link href="/biblioteca">Biblioteca</Link>
          <a href="#collection">Mi colección</a>
        </div>
        <div>
          <span>NO.23</span>
          <a href="#about">Nosotros</a>
          <a href="#kits">Kits</a>
          <a href="#newsletter">Contacto</a>
        </div>
        <div>
          <span>LEGAL</span>
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Cambios y devoluciones</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 NO.23</span>
        <span>BUENOS AIRES, ARGENTINA</span>
        <a href="#top">VOLVER ARRIBA ↑</a>
      </div>
    </footer>
  );
}
