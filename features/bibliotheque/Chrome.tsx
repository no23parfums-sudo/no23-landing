"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { MEDIA } from "./volumes";

export function Chrome() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    mass: 0.4,
  });
  const scaleX = useTransform(progress, (v) => v);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between be-gutter py-5 md:py-6">
        <a href="#top" className="pointer-events-auto flex items-center gap-2.5">
          <img
            src={MEDIA.mark}
            alt="NO.23"
            width={816}
            height={816}
            className="h-8 w-8 opacity-90 md:h-9 md:w-9"
          />
          <span className="eyebrow hidden md:block">NO.23</span>
        </a>

        <nav className="pointer-events-auto flex items-center gap-8">
          {[
            { label: "Vitrine", href: "#vitrine" },
            { label: "Registre", href: "#registre" },
            { label: "Explorar", href: "#salon" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="eyebrow link-underline hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-end justify-between be-gutter py-5 md:py-6">
        <span className="eyebrow">Bibliothèque olfactive</span>
        <div className="flex w-24 items-center gap-3 md:w-40">
          <motion.span
            style={{ scaleX }}
            className="h-px flex-1 origin-left bg-primary/70"
          />
          <span className="eyebrow">023</span>
        </div>
      </div>
    </>
  );
}
