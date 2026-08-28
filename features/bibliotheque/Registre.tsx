"use client";

import { motion } from "motion/react";
import { ENTRIES } from "./volumes";

export function Registre() {
  return (
    <section id="registre" className="relative bg-background py-[16vh]">
      <div className="mx-auto max-w-6xl be-gutter">
        <div className="mb-8 flex items-baseline justify-between">
          <span className="eyebrow">Registre</span>
          <span className="eyebrow">Clasificación olfativa</span>
        </div>
        <div className="hairline" />

        <ul>
          {ENTRIES.map((entry, i) => (
            <li key={entry.ref}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 1,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <a
                  href={entry.href}
                  className="be-registre-row group"
                >
                  <span className="eyebrow transition-colors duration-500 group-hover:text-primary">
                    {entry.ref}
                  </span>
                  <span className="font-display text-3xl leading-none text-foreground transition-transform duration-[900ms] ease-[var(--ease-silk)] group-hover:translate-x-2 md:text-5xl">
                    {entry.name}
                  </span>
                  <span className="flex items-baseline justify-end gap-5">
                    <span className="eyebrow hidden sm:inline">{entry.count}</span>
                    <span className="eyebrow text-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      Explorar →
                    </span>
                  </span>
                </a>
              </motion.div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
