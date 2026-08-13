/**
 * Performance matter field — luminous olfactory residue (2D canvas).
 * Restored preferred radial-glow constellation/trail rendering,
 * with metric-specific motion and retained particle identity on morph.
 */

export type MatterMode =
  | "longevity"
  | "projection"
  | "sillage"
  | "season"
  | "occasion"
  | "versatility"
  | "overview";

export type MatterState = {
  build: number;
  breathe: number;
  mode: MatterMode;
  /** Continuum 0–1 or versatility breadth */
  position: number;
  /** Season / occasion weights length 4, normalized-ish 0–1 */
  weights: [number, number, number, number];
  morph: number;
  reducedMotion: boolean;
};

type Particle = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  stream: number;
  focal: number;
};

export type MatterFieldHandle = {
  setState: (next: Partial<MatterState>) => void;
  resize: () => void;
  destroy: () => void;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function readAccent(canvas: HTMLCanvasElement): {
  r: number;
  g: number;
  b: number;
} {
  const raw = getComputedStyle(canvas)
    .getPropertyValue("--perf-accent")
    .trim();
  if (raw.startsWith("#") && raw.length >= 7) {
    return {
      r: parseInt(raw.slice(1, 3), 16),
      g: parseInt(raw.slice(3, 5), 16),
      b: parseInt(raw.slice(5, 7), 16),
    };
  }
  const m = raw.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return { r: 122, g: 160, b: 192 };
}

export function createMatterField(
  canvas: HTMLCanvasElement,
  initial?: Partial<MatterState>,
): MatterFieldHandle {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return {
      setState: () => undefined,
      resize: () => undefined,
      destroy: () => undefined,
    };
  }

  const state: MatterState = {
    build: 0,
    breathe: 0,
    mode: "longevity",
    position: 0.7,
    weights: [0.55, 0.25, 0.7, 0.85],
    morph: 0,
    reducedMotion: false,
    ...initial,
  };

  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let disposed = false;
  let t0 = performance.now();
  const particles: Particle[] = [];
  const MAX_DISCOVERY = 72;
  const MAX_OVERVIEW = 28;
  let accent = readAccent(canvas);

  const maxParticles = () =>
    state.mode === "overview" ? MAX_OVERVIEW : MAX_DISCOVERY;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(1.35, window.devicePixelRatio || 1);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    accent = readAccent(canvas);
  };

  const pushParticle = (p: Omit<Particle, "px" | "py" | "focal"> & { focal?: number }) => {
    particles.push({
      ...p,
      px: p.x,
      py: p.y,
      focal: p.focal ?? (Math.random() > 0.82 ? 1 : 0),
    });
  };

  const spawnLongevity = () => {
    const persist = 0.35 + state.position * 0.65;
    pushParticle({
      x: w * (0.12 + Math.random() * 0.06),
      y: h * (0.44 + (Math.random() - 0.5) * 0.22),
      vx: (0.45 + Math.random() * 0.7) * (0.65 + state.position * 0.6),
      vy: (Math.random() - 0.5) * 0.18,
      life: 0,
      maxLife: 2.4 + persist * 3.2,
      size: 1.2 + Math.random() * 3.4,
      hue: 198 + Math.random() * 26,
      stream: 0,
    });
  };

  const spawnProjection = () => {
    const radius = 0.12 + state.position * 0.38;
    const ang = Math.random() * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.55 * radius;
    pushParticle({
      x: w * 0.5,
      y: h * 0.5,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed * 0.72,
      life: 0,
      maxLife: 1.8 + radius * 2.4,
      size: 1.4 + Math.random() * 3.8,
      hue: 200 + Math.random() * 22,
      stream: 0,
    });
  };

  const spawnSillage = () => {
    const trail = 0.3 + state.position * 0.7;
    pushParticle({
      x: w * (0.22 + Math.random() * 0.05),
      y: h * (0.5 + (Math.random() - 0.5) * 0.08),
      vx: (0.7 + Math.random() * 0.9) * trail,
      vy: (Math.random() - 0.5) * 0.12,
      life: 0,
      maxLife: 1.6 + trail * 2.8,
      size: 1.1 + Math.random() * 2.8,
      hue: 195 + Math.random() * 30,
      stream: 0,
      focal: Math.random() > 0.7 ? 1 : 0,
    });
  };

  const spawnStreams = (count: number) => {
    const stream = Math.floor(Math.random() * count);
    const weight = state.weights[stream] ?? 0.4;
    if (Math.random() > 0.35 + weight * 0.65) return;
    const xBase = 0.18 + (stream / Math.max(1, count - 1)) * 0.64;
    pushParticle({
      x: w * (xBase + (Math.random() - 0.5) * 0.04),
      y: h * (0.72 - weight * 0.28 + (Math.random() - 0.5) * 0.06),
      vx: (Math.random() - 0.5) * 0.12,
      vy: -0.15 - Math.random() * 0.35 * weight,
      life: 0,
      maxLife: 1.5 + weight * 2.2,
      size: 1.1 + Math.random() * (2 + weight * 2),
      hue: 190 + stream * 12 + Math.random() * 10,
      stream,
    });
  };

  const spawnVersatility = () => {
    const breadth = 0.35 + state.position * 0.65;
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * breadth;
    pushParticle({
      x: w * (0.5 + Math.cos(ang) * r * 0.42),
      y: h * (0.5 + Math.sin(ang) * r * 0.28),
      vx: Math.cos(ang) * (0.08 + Math.random() * 0.2),
      vy: Math.sin(ang) * (0.05 + Math.random() * 0.14),
      life: 0,
      maxLife: 2 + breadth * 2,
      size: 1.3 + Math.random() * 3.2,
      hue: 200 + Math.random() * 24,
      stream: 0,
    });
  };

  const spawn = () => {
    if (state.build < 0.05 || state.reducedMotion) return;
    if (particles.length >= maxParticles()) return;
    const rate =
      state.mode === "overview"
        ? 0.28 + state.build * 0.55
        : 0.5 + state.build * 1.35;
    if (Math.random() > rate * 0.09) return;

    switch (state.mode) {
      case "projection":
        spawnProjection();
        break;
      case "sillage":
        spawnSillage();
        break;
      case "season":
      case "occasion":
        spawnStreams(4);
        break;
      case "versatility":
        spawnVersatility();
        break;
      case "overview":
        if (Math.random() > 0.55) spawnLongevity();
        else spawnVersatility();
        break;
      default:
        spawnLongevity();
    }
  };

  const step = (dt: number, now: number) => {
    const holdCalm = state.build > 0.92 && state.morph < 0.08;
    const breath =
      state.reducedMotion || state.build < 0.35
        ? 0
        : Math.sin(now * 0.00085) * 0.5 + 0.5;
    state.breathe = breath;
    spawn();

    const persistX = w * (0.22 + state.position * 0.58);
    const projR = w * (0.1 + state.position * 0.36);
    const drag = holdCalm ? 0.62 : 1;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.px = p.x;
      p.py = p.y;
      p.life += dt;
      const age = p.life / p.maxLife;

      if (state.mode === "longevity" || state.mode === "overview") {
        const curl =
          Math.sin(p.x * 0.008 + now * 0.0004) * 0.16 +
          Math.cos(p.y * 0.012 - now * 0.0003) * 0.1;
        p.vx += curl * 0.018;
        p.vy += Math.sin(now * 0.0007 + p.x * 0.01) * 0.008;
      } else if (state.mode === "projection") {
        const dx = p.x - w * 0.5;
        const dy = p.y - h * 0.5;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist > projR) {
          p.vx *= 0.92;
          p.vy *= 0.92;
        } else if (holdCalm) {
          p.vx += (dx / dist) * 0.004 * Math.sin(now * 0.0012);
          p.vy += (dy / dist) * 0.003 * Math.sin(now * 0.0012);
        }
      } else if (state.mode === "sillage") {
        p.vy += Math.sin(p.x * 0.01 + now * 0.0005) * 0.01;
      } else if (state.mode === "versatility" && holdCalm) {
        p.vx *= 0.985;
        p.vy *= 0.985;
      }

      p.x += p.vx * (0.5 + state.build * 0.75) * 60 * dt * drag;
      p.y += p.vy * 60 * dt * drag;

      let kill = age >= 1;
      if (state.mode === "longevity") {
        const overshoot = Math.max(0, (p.x - persistX) / (w * 0.35));
        kill = kill || overshoot > 1.15 || p.x > w * 1.05;
      } else if (state.mode === "projection") {
        kill = kill || Math.hypot(p.x - w * 0.5, p.y - h * 0.5) > projR * 1.35;
      } else if (state.mode === "sillage") {
        kill = kill || p.x > w * (0.35 + state.position * 0.6);
      } else {
        kill = kill || p.y < h * 0.12 || p.x < 0 || p.x > w;
      }
      if (kill) particles.splice(i, 1);
    }
  };

  const softBlob = (
    x: number,
    y: number,
    r: number,
    a: number,
    hue: number,
    focal: number,
  ) => {
    if (a <= 0.01) return;
    const span = r * (focal ? 5.2 : 4.5);
    const grd = ctx.createRadialGradient(x, y, 0, x, y, span);
    grd.addColorStop(0, `hsla(${hue}, 36%, ${focal ? 82 : 74}%, ${a * (focal ? 1.05 : 0.95)})`);
    grd.addColorStop(0.28, `hsla(${hue}, 40%, 50%, ${a * 0.42})`);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, span, 0, Math.PI * 2);
    ctx.fill();
    if (focal > 0 && a > 0.06) {
      ctx.fillStyle = `hsla(${hue}, 42%, 90%, ${a * 0.7})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.7, r * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawTrail = (p: Particle, alpha: number, hue: number) => {
    const dx = p.x - p.px;
    const dy = p.y - p.py;
    if (Math.hypot(dx, dy) < 0.4) return;
    ctx.strokeStyle = `hsla(${hue}, 38%, 76%, ${alpha * 0.4})`;
    ctx.lineWidth = Math.max(0.45, p.size * 0.4);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.px, p.py);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const draw = (now: number) => {
    ctx.clearRect(0, 0, w, h);
    if (state.build < 0.02) return;

    const { r, g, b } = accent;
    const build = state.build * (1 - state.morph * 0.35);

    const gx =
      state.mode === "projection" || state.mode === "versatility"
        ? w * 0.5
        : w * 0.18;
    const gy = h * 0.5;
    const wash = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.42);
    wash.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.1 * build})`);
    wash.addColorStop(
      0.5,
      `rgba(${r * 0.4}, ${g * 0.45}, ${b * 0.55}, ${0.05 * build})`,
    );
    wash.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);

    if (state.mode === "longevity") {
      const persistX = w * (0.22 + state.position * 0.58);
      ctx.strokeStyle = `rgba(180, 200, 220, ${0.05 + build * 0.07})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.5);
      ctx.lineTo(persistX, h * 0.5);
      ctx.stroke();
    }

    if (state.mode === "projection") {
      const projR = w * (0.1 + state.position * 0.36);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.08 + build * 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.5, projR, projR * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (state.mode === "season" || state.mode === "occasion") {
      for (let s = 0; s < 4; s++) {
        const weight = state.weights[s] ?? 0.4;
        const x = w * (0.18 + (s / 3) * 0.64);
        const hh = h * (0.18 + weight * 0.42);
        const col = ctx.createLinearGradient(x, h * 0.72, x, h * 0.72 - hh);
        col.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.02 * build})`);
        col.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${0.1 * build * weight})`);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(x - 18, h * 0.72);
        ctx.quadraticCurveTo(x, h * 0.72 - hh, x + 18, h * 0.72);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = "lighter";
    for (const p of particles) {
      const age = p.life / p.maxLife;
      const fade = (1 - age) * build;
      let alpha = fade * (0.32 + state.breathe * 0.08);
      if (state.mode === "longevity") {
        const persistX = w * (0.22 + state.position * 0.58);
        const overshoot = Math.max(0, (p.x - persistX) / (w * 0.28));
        alpha *= 1 - overshoot;
      }
      if (
        state.mode === "sillage" ||
        state.mode === "longevity" ||
        state.mode === "versatility"
      ) {
        drawTrail(p, alpha, p.hue);
      }
      softBlob(
        p.x,
        p.y,
        p.size * (1.05 + (1 - age) * 1.6),
        alpha,
        p.hue,
        p.focal,
      );
    }
    ctx.globalCompositeOperation = "source-over";

    if (state.build > 0.85 && state.mode === "longevity") {
      const persistX = w * (0.22 + state.position * 0.58);
      const bloom = ctx.createRadialGradient(
        persistX,
        h * 0.5,
        0,
        persistX,
        h * 0.5,
        w * 0.11,
      );
      const a = 0.035 + state.breathe * 0.025;
      bloom.addColorStop(0, `rgba(160, 195, 220, ${a})`);
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);
    }

    void now;
  };

  const loop = (now: number) => {
    if (disposed) return;
    const dt = Math.min(0.033, (now - t0) / 1000);
    t0 = now;
    if (!state.reducedMotion) step(dt, now);
    draw(now);
    raf = window.requestAnimationFrame(loop);
  };

  resize();
  raf = window.requestAnimationFrame(loop);

  return {
    setState: (next) => {
      const modeChanged = Boolean(next.mode && next.mode !== state.mode);
      Object.assign(state, next);
      if (typeof next.position === "number") state.position = clamp01(next.position);
      if (typeof next.build === "number") state.build = clamp01(next.build);
      if (typeof next.morph === "number") state.morph = clamp01(next.morph);
      if (modeChanged) {
        for (const p of particles) {
          p.vx *= 0.45;
          p.vy *= 0.45;
          p.maxLife *= 0.72;
        }
        while (particles.length > maxParticles()) particles.pop();
      }
    },
    resize,
    destroy: () => {
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
      particles.length = 0;
      ctx.clearRect(0, 0, w, h);
    },
  };
}

/** @deprecated */
export const createLongevityField = (
  canvas: HTMLCanvasElement,
  initial?: Partial<MatterState>,
) => createMatterField(canvas, { mode: "longevity", ...initial });
