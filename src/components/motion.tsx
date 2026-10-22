import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion, useInView } from "../lib/hooks";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\_▓";

export interface HeadingPart {
  t: string;
  em?: boolean;
}

/** Parse "Making complex workflows feel *effortless*." → parts with the starred word in serif italic. */
export function parseAccent(text: string): HeadingPart[] {
  return text.split(/(\*[^*]+\*)/).filter(Boolean).map((s) => (s.startsWith("*") ? { t: s.slice(1, -1), em: true } : { t: s }));
}

interface DecodeProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}

/** Glyph-decode heading: letters cycle through random glyphs then lock left → right, once. */
export function Decode({ text, as = "h2", className, id }: DecodeProps) {
  const parts = parseAccent(text);
  const plain = parts.map((p) => p.t).join("");
  const [ref, inView] = useInView<HTMLHeadingElement>({ threshold: 0.4 });
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? plain.length : -1));
  const [, force] = useState(0);

  useEffect(() => {
    if (!inView || progress >= plain.length) return;
    const total = Math.min(900, 380 + plain.length * 14);
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / total);
      if (now - last > 45) {
        last = now;
        setProgress(Math.floor(k * plain.length));
        force((n) => n + 1);
      }
      if (k < 1) raf = requestAnimationFrame(tick);
      else setProgress(plain.length);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  let offset = 0;
  const children = parts.map((p, i) => {
    const start = offset;
    offset += p.t.length;
    const shown = [...p.t]
      .map((ch, j) => {
        const idx = start + j;
        if (ch === " " || progress === -1 || idx < progress) return ch;
        return GLYPHS[(Math.random() * GLYPHS.length) | 0];
      })
      .join("");
    return p.em ? (
      <em key={i} className="serif">
        {shown}
      </em>
    ) : (
      <span key={i}>{shown}</span>
    );
  });

  return createElement(
    as,
    { ref, className, id, "aria-label": plain },
    <span aria-hidden="true" style={progress === -1 ? { opacity: 0 } : undefined}>
      {children}
    </span>,
  );
}

interface StreamProps {
  text: string;
  className?: string;
  as?: "p" | "span" | "div";
  msPerWord?: number;
  start?: boolean;
  onDone?: () => void;
  /** keep caret until this many ms after finishing */
  caretHold?: number;
}

/** Token stream: words appear one by one with a blinking caret. Space is reserved up front (no layout shift). */
export function Stream({ text, className, as = "p", msPerWord = 38, start, onDone, caretHold = 1200 }: StreamProps) {
  const words = text.split(/(\s+)/);
  const wordCount = words.filter((w) => !/^\s+$/.test(w)).length;
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.3 });
  const [n, setN] = useState(() => (prefersReducedMotion() ? wordCount : 0));
  const [caret, setCaret] = useState(false);
  const go = start ?? inView;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setN(prefersReducedMotion() ? wordCount : 0);
  }, [text, wordCount]);

  useEffect(() => {
    if (!go) return;
    if (n >= wordCount) {
      doneRef.current?.();
      setCaret(true);
      const t = setTimeout(() => setCaret(false), caretHold);
      return () => clearTimeout(t);
    }
    setCaret(true);
    const t = setTimeout(() => setN((x) => x + 1), msPerWord);
    return () => clearTimeout(t);
  }, [go, n, wordCount, msPerWord, caretHold]);

  let w = 0;
  const nodes: ReactNode[] = words.map((tok, i) => {
    if (/^\s+$/.test(tok)) return tok;
    const visible = w < n;
    const isLast = w === n - 1;
    w++;
    return (
      <span key={i}>
        <span className={`stream-word${visible ? "" : " is-ghost"}`}>{tok}</span>
        {isLast && caret && n < wordCount ? <span className="caret" aria-hidden="true">▍</span> : null}
      </span>
    );
  });
  return createElement(
    as,
    { ref, className },
    nodes,
    caret && n >= wordCount ? (
      <span className="caret" aria-hidden="true">
        ▍
      </span>
    ) : null,
  );
}

export function CountUp({ value, prefix = "", suffix = "", duration = 1400, className }: { value: number; prefix?: string; suffix?: string; duration?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const [v, setV] = useState(() => (prefersReducedMotion() ? value : 0));
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(Math.round(value * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  return (
    <span ref={ref} className={`tnum ${className ?? ""}`} aria-label={`${prefix}${value.toLocaleString("en-IN")}${suffix}`}>
      <span aria-hidden="true">
        {prefix}
        {v.toLocaleString("en-IN")}
        {suffix}
      </span>
    </span>
  );
}

/** Pulls its first child slightly toward the cursor (desktop, motion allowed). */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current;
    const el = host?.firstElementChild as HTMLElement | null;
    if (!host || !el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.setProperty("--mx", `${Math.max(-14, Math.min(14, dx * strength))}px`);
      el.style.setProperty("--my", `${Math.max(-10, Math.min(10, dy * strength))}px`);
    };
    const leave = () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  // padding gives the 40px "pull zone" around the button
  return (
    <span ref={ref} style={{ display: "inline-block", padding: 20, margin: -20 }}>
      {children}
    </span>
  );
}

export function Reveal({ children, className = "", delay = 0, as = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" | "article" }) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return createElement(as, { ref, className: `reveal ${inView ? "is-in" : ""} ${className}`, style }, children);
}

export function RegMarks() {
  return (
    <>
      <span className="reg-mark tl" aria-hidden="true" />
      <span className="reg-mark tr" aria-hidden="true" />
      <span className="reg-mark bl" aria-hidden="true" />
      <span className="reg-mark br" aria-hidden="true" />
    </>
  );
}

export function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="sec-label label">
      <b>§ {n}</b> — {children}
    </p>
  );
}
