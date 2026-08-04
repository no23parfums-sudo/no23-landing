"use client";

import { useState, type FormEvent } from "react";
import { SectionLabel } from "@/shared/ui";

export function NewsletterSection() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setMessage(`Gracias. Registramos ${email} para el acceso anticipado.`);
    form.reset();
  }

  return (
    <section className="newsletter-section" id="newsletter">
      <div>
        <SectionLabel kind="section-kicker">PRIMER ACCESO</SectionLabel>
        <h2>NO.23 está por comenzar.</h2>
        <p>
          Dejanos tu mail para recibir acceso anticipado, novedades y la
          apertura de los primeros kits.
        </p>
      </div>
      <form
        className="newsletter-form"
        data-newsletter-form
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="newsletter-email">
          Correo electrónico
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="Tu correo electrónico"
          required
          autoComplete="email"
        />
        <button type="submit">Sumarme</button>
        <p
          className="form-message"
          data-form-message
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message}
        </p>
      </form>
    </section>
  );
}
