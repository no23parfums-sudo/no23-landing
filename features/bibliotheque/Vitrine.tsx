"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { VOLUMES } from "./volumes";

export function Vitrine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["2vw", "-78vw"]);

  return (
    <section id="vitrine" ref={ref} className="relative h-[420svh] bg-background">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mb-10 flex items-baseline justify-between px-6 pt-16 md:px-10 md:pt-10">
          <span className="eyebrow">( 002 ) La vitrine</span>
          <span className="eyebrow">04 volumes exposés</span>
        </div>

        <motion.ul style={{ x }} className="flex items-end gap-[6vw] pl-6 md:pl-10">
          {VOLUMES.map((v, i) => (
            <li
              key={v.n}
              className="group relative w-[74vw] shrink-0 md:w-[34vw]"
              style={{ marginBottom: i % 2 === 0 ? "0" : "8vh" }}
            >
              <div className="grain relative overflow-hidden bg-card shadow-[var(--shadow-vitrine)]">
                <img
                  src={v.image}
                  alt={v.title}
                  loading="lazy"
                  width={912}
                  height={1200}
                  className="h-[46vh] w-full object-cover opacity-85 transition-all duration-[1200ms] ease-[var(--ease-silk)] group-hover:scale-[1.04] group-hover:opacity-100 md:h-[54vh]"
                />
                <div className="pointer-events-none absolute inset-0 border border-primary/15" />
                <span className="font-display absolute left-4 top-3 text-2xl text-primary/80">
                  {v.n}
                </span>
              </div>

              <div className="mt-5 flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-display text-2xl leading-none md:text-3xl">
                    {v.title}
                  </h3>
                  <p className="eyebrow mt-3">{v.family}</p>
                </div>
                <span className="eyebrow shrink-0">{v.year}</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                {v.note}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
