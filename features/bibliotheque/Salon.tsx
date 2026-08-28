"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { MEDIA } from "./volumes";

export function Salon() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 0.5]);

  return (
    <section
      id="salon"
      ref={ref}
      className="grain relative flex min-h-svh items-center overflow-hidden"
    >
      <motion.img
        style={{ scale, opacity }}
        src={MEDIA.hero}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1920}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="veil absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-5xl be-gutter py-[16vh] text-center">
        <span className="eyebrow">( 004 ) Le salon privé</span>
        <motion.h2
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mt-8 text-5xl leading-[0.95] md:text-8xl"
        >
          On entre <em className="not-italic">par le parfum,</em>
          <br />
          on repart <em className="italic">par la mémoire.</em>
        </motion.h2>

        <p className="mx-auto mt-10 max-w-md text-sm leading-relaxed text-muted-foreground">
          La Bibliothèque se recorre. Cada entrada abre una materia, una casa,
          una nariz.
        </p>

        <a
          href="#top"
          className="link-underline mt-12 inline-flex items-center gap-4 border border-primary/30 px-8 py-4 transition-colors duration-700 hover:border-primary/70"
        >
          <span className="eyebrow text-foreground">Descubrir</span>
        </a>
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-10 be-gutter pb-24">
        <div className="hairline mb-6" />
        <div className="flex items-center justify-between">
          <img
            src={MEDIA.mark}
            alt="NO.23"
            loading="lazy"
            width={816}
            height={816}
            className="h-8 w-8 opacity-70"
          />
          <span className="eyebrow">© NO.23</span>
        </div>
      </footer>
    </section>
  );
}
