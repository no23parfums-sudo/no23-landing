"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { MEDIA } from "./volumes";

const TITLE = "BIBLIOTHÈQUE";

const MOTES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  size: 1 + (i % 5) * 0.5,
  duration: 12 + (i % 8) * 2.5,
  delay: -((i * 7) % 20),
}));

function DustMotes() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden opacity-60">
      {MOTES.map((mote) => (
        <motion.span
          key={mote.id}
          className="absolute rounded-full bg-primary/70 shadow-[0_0_6px_var(--color-primary)]"
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 12, -8, 14, 0],
            opacity: [0.2, 0.8, 0.4, 0.9, 0.2],
            scale: [1, 1.4, 0.9, 1.2, 1],
          }}
          transition={{
            duration: mote.duration,
            repeat: Infinity,
            delay: mote.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 30 });
  const spotlight = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x}% ${y}%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 60%)`,
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 100);
      mouseY.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <section id="top" ref={ref} className="relative h-[112svh] w-full overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={MEDIA.hero}
          alt="Bibliothèque NO.23"
          width={1920}
          height={1200}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="veil absolute inset-0" />
        <motion.div
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{ background: spotlight }}
        />
        <div className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(circle_at_50%_0%,transparent_0%,var(--ink)_120%)] opacity-40" />
      </motion.div>

      <DustMotes />

      <motion.div
        style={{ opacity: fade }}
        className="grain relative z-10 flex h-svh flex-col items-center justify-center be-gutter text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow"
        >
          NO.23
        </motion.span>

        <h1 className="font-display mt-6 flex flex-wrap justify-center text-[15vw] leading-[0.86] tracking-[0.02em] md:text-[11vw]">
          {TITLE.split("").map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              initial={{ opacity: 0, y: "40%", filter: "blur(14px)" }}
              animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
              transition={{
                delay: 0.55 + i * 0.055,
                duration: 1.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block text-foreground"
            >
              {char}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.6, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="be-gold-rule mt-8 h-px w-24 origin-center md:w-36"
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground md:max-w-lg md:text-base"
        >
          Un archivo vivo de perfumería.
          <br />
          Explorá perfumes, materias, perfumistas y casas a través de una
          lectura editorial de NO.23.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1.4 }}
          className="absolute bottom-[68px] flex flex-col items-center gap-3"
        >
          <span className="eyebrow candle-flicker">Descubrir</span>
          <motion.span
            animate={{ scaleY: [0.2, 1, 0.2], originY: 0 }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-14 w-px bg-primary/60"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
