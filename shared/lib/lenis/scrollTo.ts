import type Lenis from "lenis";

declare global {
  interface Window {
    __NO23_LENIS?: Lenis;
  }
}

/** Hash / review navigation — uses Lenis when live, native otherwise. */
export function scrollToElement(id: string, offset = 0) {
  const node = document.getElementById(id);
  if (!node) return;

  const lenis = window.__NO23_LENIS;
  if (lenis) {
    lenis.scrollTo(node, { offset, duration: 0.85 });
    return;
  }

  node.scrollIntoView({ behavior: "smooth", block: "start" });
}
