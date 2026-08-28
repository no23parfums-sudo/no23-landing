"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

const TEXT =
  "Un perfume nunca existe aislado. Detrás de cada creación hay una materia, una época, una casa y una nariz.";

const EMPHASIS = new Set(["materia", "época", "casa", "nariz"]);

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const blur = useTransform(progress, range, ["blur(6px)", "blur(0px)"]);
  return (
    <motion.span
      style={{ opacity, filter: blur }}
      className={`mr-[0.28em] inline-block ${
        EMPHASIS.has(word.replace(/[.,]$/, "")) ? "text-primary" : ""
      }`}
    >
      {word}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.15"],
  });
  const words = TEXT.split(" ");

  return (
    <section className="relative bg-background py-[18vh]">
      <div className="mx-auto max-w-5xl be-gutter">
        <div className="mb-14 flex items-baseline justify-between">
          <span className="eyebrow">( 001 )</span>
          <span className="eyebrow">Manifiesto</span>
        </div>
        <div className="hairline mb-14" />
        <p
          ref={ref}
          className="font-display flex flex-wrap text-3xl leading-[1.22] tracking-tight md:text-5xl md:leading-[1.18]"
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word
                key={`${word}-${i}`}
                word={word}
                range={[start, end]}
                progress={scrollYProgress}
              />
            );
          })}
        </p>
      </div>
    </section>
  );
}
