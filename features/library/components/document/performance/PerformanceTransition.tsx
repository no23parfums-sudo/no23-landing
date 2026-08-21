"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PerfVariantVisual } from "./PerfVariantVisual";

export type PerformanceTransitionApi = {
  progress: MotionValue<number>;
  settled: boolean;
};

type PerformanceTransitionProps = {
  smokeFilmSrc?: string;
  mode: "editorial" | "narrative";
  reduceMotion: boolean;
  children: (api: PerformanceTransitionApi) => ReactNode;
};

const CINEMA_RATIO = 16 / 9;

/**
 * Section 3→4 chapter bridge.
 * Editorial (C1): cinematic plate, retreats left, then dissolves.
 * Narrative (C3): keeps the earlier left-column settle.
 */
export function PerformanceTransition({
  smokeFilmSrc,
  mode,
  reduceMotion,
  children,
}: PerformanceTransitionProps) {
  const filmExits = mode === "editorial";
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [cinemaH, setCinemaH] = useState(82);
  const [settled, setSettled] = useState(reduceMotion);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;
    const measure = () => {
      const w = pin.clientWidth;
      const h = pin.clientHeight;
      if (w < 8 || h < 8) return;
      const plate = Math.min(w / CINEMA_RATIO, h * 0.86);
      setCinemaH(Math.min(86, Math.max(62, (plate / h) * 100)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(pin);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    setSettled((current) => {
      const next = filmExits ? value >= 0.22 : value >= 0.36;
      return current === next ? current : next;
    });
  });

  const transformT = useTransform(
    scrollYProgress,
    filmExits ? [0.08, 0.24, 1] : [0.12, 0.36, 1],
    [0, 1, 1],
  );
  const visualWidth = useTransform(() => {
    const t = reduceMotion ? 1 : transformT.get();
    return filmExits ? `${100 - t * 42}%` : `${100 - t * 70}%`;
  });
  const visualHeight = useTransform(() => {
    const t = reduceMotion ? 1 : transformT.get();
    if (filmExits) {
      const widthPct = 100 - t * 42;
      return `${(cinemaH * widthPct) / 100}%`;
    }
    return `${cinemaH + t * (100 - cinemaH)}%`;
  });
  const visualTop = useTransform(() => {
    const t = reduceMotion ? 1 : transformT.get();
    const cinemaTop = (100 - cinemaH) / 2;
    if (filmExits) {
      const heightPct = (cinemaH * (100 - t * 42)) / 100;
      return `${(100 - heightPct) / 2}%`;
    }
    return `${cinemaTop * (1 - t)}%`;
  });
  const filmX = useTransform(() => {
    const t = reduceMotion ? 1 : transformT.get();
    return 50 + t * 16;
  });
  const filmY = useTransform(() => {
    const t = reduceMotion ? 1 : transformT.get();
    return 47 - t * 12;
  });
  const filmPosition = useTransform(() => `${filmX.get()}% ${filmY.get()}%`);
  const filmOpacity = useTransform(
    scrollYProgress,
    filmExits ? [0.18, 0.34, 1] : [0, 1, 1],
    filmExits ? [1, 0, 0] : [1, 1, 1],
  );
  const readingOpacity = useTransform(
    scrollYProgress,
    filmExits ? [0.14, 0.26, 1] : [0.32, 0.44, 1],
    [0, 1, 1],
  );
  const readingInset = useTransform(
    scrollYProgress,
    filmExits ? [0.16, 0.34, 1] : [0, 1, 1],
    filmExits ? [42, 0, 0] : [0, 0, 0],
  );
  const readingLeft = useTransform(
    () => `calc(${readingInset.get()}% )`,
  );
  const readingWidth = useTransform(() => `${100 - readingInset.get()}%`);

  return (
    <section
      ref={sectionRef}
      className={`performance-section perf-v perf-x perf-x--${mode}`}
      aria-labelledby="performance-title-x"
      data-reduced={reduceMotion ? "true" : undefined}
      data-film={filmExits ? "exit" : "anchor"}
    >
      <h2 id="performance-title-x" className="sr-only">
        Cómo se comporta
      </h2>

      <div className="perf-x__breath">
        <p className="perf-x__breath-id">04 / Performance</p>
      </div>

      <div ref={pinRef} className="perf-x__pin">
        <div className="perf-x__layout">
          <motion.div
            className="perf-x__frame"
            style={
              reduceMotion
                ? { opacity: 0, pointerEvents: "none" }
                : {
                    width: visualWidth,
                    height: visualHeight,
                    top: visualTop,
                    opacity: filmOpacity,
                    ["--film-position" as string]: filmPosition,
                    pointerEvents: "none",
                  }
            }
          >
            <PerfVariantVisual
              src={smokeFilmSrc}
              className="perf-x__visual"
              reduceMotion={reduceMotion}
              fit="cover"
            />
          </motion.div>

          <motion.div
            className="perf-x__reading"
            style={
              reduceMotion
                ? undefined
                : {
                    opacity: readingOpacity,
                    ...(filmExits
                      ? { marginLeft: readingLeft, width: readingWidth }
                      : {}),
                  }
            }
          >
            {children({
              progress: scrollYProgress,
              settled: reduceMotion || settled,
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
