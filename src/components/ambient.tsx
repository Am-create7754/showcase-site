import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion, safeStorage, useMediaQuery } from "../lib/hooks";

/* ───────────── Boot loader — once per session, ≤ 1.4 s ───────────── */
const BOOT_LINES = ["> loading weights… ok", "> mapping workflows… ok", "> initialising curiosity… ok", "> ready."];

export function BootLoader() {
  const [phase, setPhase] = useState<"off" | "typing" | "wipe">(() => {
    if (prefersReducedMotion()) return "off";
    return safeStorage("session").get("booted") ? "off" : "typing";
  });
  const [lines, setLines] = useState(0);

  useEffect(() => {
    if (phase === "off") return;
    safeStorage("session").set("booted", "1");
    const timers = BOOT_LINES.map((_, i) => setTimeout(() => setLines(i + 1), 120 + i * 200));
    timers.push(setTimeout(() => setPhase("wipe"), 1000));
    timers.push(setTimeout(() => setPhase("off"), 1400));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "off") return null;
  return (
    <div className={`boot ${phase === "wipe" ? "is-wiping" : ""}`} aria-hidden="true">
      <div className="boot-inner">
        <p className="label label--sm boot-title">amber-sahay / portfolio</p>
        {BOOT_LINES.slice(0, lines).map((l) => (
          <p key={l} className="boot-line">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Custom cursor — fine pointers only ───────────── */
export function Cursor() {
  const fine = useMediaQuery("(pointer: fine) and (hover: hover)");
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"default" | "link" | "open" | "text">("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add("has-cursor");
    const reduced = prefersReducedMotion();
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      setVisible(true);
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const tagged = t?.closest?.("[data-cursor]")?.getAttribute("data-cursor");
      if (tagged === "open") setMode("open");
      else if (t?.closest?.("input, textarea, select, [contenteditable]")) setMode("text");
      else if (tagged === "link" || t?.closest?.("a, button, label, [role='tab']")) setMode("link");
      else setMode("default");
    };
    const leave = () => setVisible(false);
    const loop = () => {
      rx += (x - rx) * (reduced ? 1 : 0.2);
      ry += (y - ry) * (reduced ? 1 : 0.2);
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, [fine]);

  if (!fine) return null;
  return (
    <div className={`cursor cursor--${mode} ${visible ? "is-visible" : ""}`} aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <span className="cursor-ring-shape">
          <span className="cursor-pill-text">OPEN ↗</span>
        </span>
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}

/* ───────────── Tokens counter — scroll progress, doubles as back-to-top ───────────── */
const TOKEN_BUDGET = 64000;

export function TokenCounter() {
  const [p, setP] = useState(0);
  const { pathname } = useLocation();
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setP(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [pathname]);
  const tokens = Math.round((p * TOKEN_BUDGET) / 10) * 10;
  return (
    <>
      <div className="progress-top" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
      <button
        type="button"
        className={`tokens ${p > 0.02 ? "is-on" : ""}`}
        onClick={() => window.scrollTo({ top: 0 })}
        aria-label={`Page ${Math.round(p * 100)}% read — back to top`}
        tabIndex={p > 0.02 ? 0 : -1}
      >
        <span className="tokens-label">TOKENS</span>
        <span className="tnum">{tokens.toLocaleString("en-IN")}</span>
        <span className="tokens-of">/ {TOKEN_BUDGET.toLocaleString("en-IN")}</span>
        <span className="tokens-bar" style={{ transform: `scaleX(${p})` }} />
      </button>
    </>
  );
}

/* ───────────── Neural dot-field — hero background canvas ───────────── */
export function NeuralField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduced = prefersReducedMotion();
    const small = window.matchMedia("(max-width: 699px)").matches;
    const SP = small ? 26 : 18;
    const R = 140;
    let w = 0, h = 0, cols = 0, rows = 0, dpr = 1;
    let mouse: { x: number; y: number } | null = null;
    let running = false, visible = true, raf = 0;
    let colors = { ink: "#0e0e0c", signal: "#2d5bff" };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = { ink: s.getPropertyValue("--ink").trim() || colors.ink, signal: s.getPropertyValue("--signal").trim() || colors.signal };
    };
    const resize = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / SP) + 1;
      rows = Math.ceil(h / SP) + 1;
      if (reduced || !running) draw(0);
    };

    const act = new Float32Array(4096 * 4);
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const n = cols * rows;
      const strength = act.length >= n ? act : new Float32Array(n);
      ctx.fillStyle = colors.ink;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * SP, y = j * SP;
          let f = 0;
          if (mouse && !reduced) {
            const dx = mouse.x - x, dy = mouse.y - y;
            const d = Math.hypot(dx, dy);
            if (d < R) f = 1 - d / R;
          }
          strength[j * cols + i] = f;
          if (f > 0) continue;
          const breath = reduced ? 0.16 : 0.13 + 0.08 * Math.sin(t * 0.0011 + (x + y) * 0.011);
          ctx.globalAlpha = breath;
          ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
        }
      }
      if (!mouse || reduced) {
        ctx.globalAlpha = 1;
        return;
      }
      // active dots + connecting lines
      ctx.strokeStyle = colors.signal;
      ctx.lineWidth = 0.6;
      const pos = (i: number, j: number) => {
        const f = strength[j * cols + i];
        const x = i * SP, y = j * SP;
        return [x + (mouse!.x - x) * f * 0.14, y + (mouse!.y - y) * f * 0.14, f] as const;
      };
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const f = strength[j * cols + i];
          if (f <= 0) continue;
          const [x, y] = pos(i, j);
          if (f > 0.35) {
            for (const [di, dj] of [[1, 0], [0, 1], [1, 1]] as const) {
              const ni = i + di, nj = j + dj;
              if (ni >= cols || nj >= rows) continue;
              const nf = strength[nj * cols + ni];
              if (nf > 0.35) {
                const [nx, ny] = pos(ni, nj);
                ctx.globalAlpha = Math.min(f, nf) * 0.45;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nx, ny);
                ctx.stroke();
              }
            }
          }
          ctx.globalAlpha = 0.25 + f * 0.7;
          ctx.fillStyle = colors.signal;
          ctx.beginPath();
          ctx.arc(x, y, 0.8 + f * 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 15) return; // ~60fps cap
      last = t;
      draw(t);
    };
    const start = () => {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      mouse = x >= -R && y >= -R && x <= r.width + R && y <= r.height + R ? { x, y } : null;
    };
    const onVis = () => (document.hidden ? stop() : start());
    const onTheme = () => {
      readColors();
      if (!running) draw(0);
    };

    readColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(cv);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("themechange", onTheme);
    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("themechange", onTheme);
    };
  }, []);

  return <canvas ref={canvas} className="neural-field" aria-hidden="true" />;
}
