import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BarChart3, Bot, FileText, FlaskConical, LayoutPanelTop, Workflow, type LucideIcon } from "lucide-react";
import { PROCESS, SKILL_GROUPS, TOOLBELT } from "../data/profile";
import { prefersReducedMotion } from "../lib/hooks";
import { Reveal } from "./motion";

/* ───────────── Toolbelt marquee ───────────── */
export function Marquee() {
  const row = (outlined: boolean) => (
    <div className={`marquee-row ${outlined ? "is-outline is-reverse" : ""}`}>
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <span key={copy} className="marquee-copy" aria-hidden={copy === 1 || outlined ? true : undefined}>
            {TOOLBELT.map((t) => (
              <Fragment key={t}>
                <span>{t}</span>
                <span className="marquee-sep">/</span>
              </Fragment>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <section className="marquee" aria-label="Tools I use">
      {row(false)}
      {row(true)}
    </section>
  );
}

/* ───────────── Capabilities ───────────── */
interface Capability {
  icon: LucideIcon;
  title: string;
  line: string;
  stack: string[];
  proof: { label: string; to: string };
}

const CAPABILITIES: Capability[] = [
  {
    icon: Workflow,
    title: "Workflow mapping & automation",
    line: "Find the repetitive step in a process and build the small tool that removes it.",
    stack: ["Python", "React", "Scripts", "Local logic"],
    proof: { label: "Design workflow prototype", to: "/work/design-workflow-assistant" },
  },
  {
    icon: Bot,
    title: "Grounded agents & tool calling",
    line: "Route questions to validated tools; let the model explain, not invent.",
    stack: ["OpenAI API", "Tool calling", "Pydantic"],
    proof: { label: "IPL Intelligence", to: "/work/ipl-intelligence" },
  },
  {
    icon: FlaskConical,
    title: "Evaluation & testing",
    line: "Golden data, regression suites and fuzzing — so behaviour is proven, not assumed.",
    stack: ["Pytest", "Vitest", "Hypothesis", "CI"],
    proof: { label: "AppSec Guardrail", to: "/work/shadow-ai-guardrail" },
  },
  {
    icon: BarChart3,
    title: "Data & visualization",
    line: "Turn dense numerical data into charts that support investigation.",
    stack: ["DuckDB", "Parquet", "SQL", "Plotly"],
    proof: { label: "IPL Intelligence", to: "/work/ipl-intelligence" },
  },
  {
    icon: LayoutPanelTop,
    title: "Interface & product thinking",
    line: "Design flows around what each kind of user is actually trying to do.",
    stack: ["React", "Node.js", "PostgreSQL"],
    proof: { label: "MaDDoC", to: "/work/maddoc" },
  },
  {
    icon: FileText,
    title: "Documentation & communication",
    line: "Explain how a tool works, where it stops, and what to try next.",
    stack: ["READMEs", "Tutorials", "Case studies"],
    proof: { label: "About & leadership", to: "/about" },
  },
];

export function Capabilities() {
  return (
    <div className="cap-grid">
      {CAPABILITIES.map((c, i) => {
        const Icon = c.icon;
        return (
          <Reveal as="article" key={c.title} className="cap-cell" delay={i * 60}>
            <div className="cap-top">
              <span className="label label--sm muted">C/0{i + 1}</span>
              <Icon aria-hidden="true" strokeWidth={1.5} className="cap-icon" />
            </div>
            <h3 className="h4">{c.title}</h3>
            <p className="muted">{c.line}</p>
            <div className="cap-more">
              <div className="chips">
                <span className="label label--sm muted">Stack:</span>
                {c.stack.map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
              <Link to={c.proof.to} className="text-link">
                Proof: {c.proof.label} <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/* ───────────── Process track ───────────── */
export function ProcessTrack() {
  const ref = useRef<HTMLOListElement>(null);
  const [p, setP] = useState(prefersReducedMotion() ? 1 : 0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        setP(Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35))));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, []);
  return (
    <ol ref={ref} className="process" style={{ ["--p" as string]: p }}>
      <span className="process-line" aria-hidden="true" />
      {PROCESS.map((s, i) => (
        <li key={s.n} className={`process-step ${p >= i / PROCESS.length ? "is-on" : ""}`}>
          <span className="process-node" aria-hidden="true" />
          <span className="label signal">{s.n}</span>
          <h3 className="h4">{s.title}</h3>
          <p className="muted">{s.line}</p>
          <p className="process-artefact label label--sm">↳ {s.artefact}</p>
        </li>
      ))}
    </ol>
  );
}

/* ───────────── Skills snapshot ───────────── */
export function SkillsGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`skills ${compact ? "skills--compact" : ""}`}>
      {SKILL_GROUPS.map((g, i) => (
        <Reveal key={g.title} className="skill-group" delay={i * 70}>
          <p className="label label--sm muted">0{i + 1}</p>
          <h3 className="h4">{g.title}</h3>
          {!compact && <p className="muted skill-note">{g.note}</p>}
          <ul>
            {g.items.map((it) => (
              <li key={it.name} className={it.used ? "is-used" : ""}>
                <span className="skill-mark" aria-hidden="true" />
                {it.name}
                <span className="sr-only">{it.used ? " (used in a project on this site)" : " (working familiarity)"}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
      <p className="skills-legend label label--sm muted">
        <span>
          <span className="skill-mark is-filled" aria-hidden="true" /> used in a project on this site
        </span>
        <span>
          <span className="skill-mark" aria-hidden="true" /> working familiarity
        </span>
      </p>
    </div>
  );
}

/* ───────────── Flow diagram (boxes & arrows) ───────────── */
export interface FlowStep {
  label: string;
  sub?: string;
  tone?: "ai" | "code" | "human" | "default";
}

export function FlowDiagram({ steps, active, caption }: { steps: FlowStep[]; active?: number; caption?: ReactNode }) {
  return (
    <figure className="flow">
      <ol className="flow-steps">
        {steps.map((s, i) => (
          <li key={s.label} className={`flow-step flow-step--${s.tone ?? "default"} ${active !== undefined && i <= active ? "is-on" : ""} ${active === i ? "is-current" : ""}`}>
            <span className="flow-n label label--sm">{String(i + 1).padStart(2, "0")}</span>
            <span className="flow-label">{s.label}</span>
            {s.sub && <span className="flow-sub">{s.sub}</span>}
            {i < steps.length - 1 && <ArrowRight className="flow-arrow" aria-hidden="true" strokeWidth={1.5} />}
          </li>
        ))}
      </ol>
      {caption && <figcaption className="label label--sm muted">{caption}</figcaption>}
    </figure>
  );
}
