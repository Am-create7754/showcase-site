import { MATCH } from "../data/mock/ipl";
import { cumulative, phaseStats } from "../lib/ipl";

/* Small, art-directed compositions used as project thumbnails. They are illustrations of
   each project's interface ideas built from this site's own components and sample data —
   not screenshots of the real applications. */

export function IplVisual() {
  const W = 320, H = 150;
  const cums = MATCH.innings.map(cumulative);
  const max = 200;
  const line = (c: number[]) => c.map((v, i) => `${(i / 19) * W},${H - (v / max) * H}`).join(" ");
  const phases = MATCH.innings.map(phaseStats);
  return (
    <div className="viz viz-ipl">
      <div className="viz-ipl-stats">
        {[
          ["186/6", "IND total"],
          ["168/8", "SAF total"],
          ["3 for 12", "collapse, ov 7–9"],
        ].map(([v, l]) => (
          <div key={l}>
            <b className="tnum">{v}</b>
            <span>{l}</span>
          </div>
        ))}
      </div>
      <div className="viz-ipl-main">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="viz-worm" aria-hidden="true">
          {[0.25, 0.5, 0.75].map((k) => (
            <line key={k} x1="0" x2={W} y1={H * k} y2={H * k} className="viz-gridline" />
          ))}
          <rect x={(6 / 19) * W} width={(3 / 19) * W} y="0" height={H} className="viz-band" />
          <polyline points={line(cums[0])} className="viz-line-a" />
          <polyline points={line(cums[1])} className="viz-line-b" />
        </svg>
        <div className="viz-ipl-bars" aria-hidden="true">
          {phases[0].map((p, i) => (
            <div key={p.phase} className="viz-barpair">
              <i style={{ height: `${(p.runRate / 13) * 100}%` }} />
              <i style={{ height: `${(phases[1][i].runRate / 13) * 100}%` }} />
              <span>{p.phase.slice(0, 2).toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="viz-q">
        <span>&gt;</span> where did the chase turn?
      </p>
    </div>
  );
}

export function GuardrailVisual() {
  return (
    <div className="viz viz-gr">
      <div className="viz-gr-row">
        <span className="viz-gr-tag">ORIGINAL</span>
        <p>
          Reply to <mark className="m-pii">priya.demo@example.com</mark>, phone <mark className="m-pii">98765 43210</mark> about the refund…
        </p>
      </div>
      <div className="viz-gr-flow" aria-hidden="true">
        {["inspect", "policy", "redact", "audit"].map((s, i) => (
          <span key={s} className={i === 2 ? "is-on" : ""}>
            {s}
          </span>
        ))}
      </div>
      <div className="viz-gr-row">
        <span className="viz-gr-tag viz-gr-tag--ok">SENT</span>
        <p>
          Reply to <span className="m-red">[REDACTED:EMAIL]</span>, phone <span className="m-red">[REDACTED:PHONE]</span> about the refund…
        </p>
      </div>
      <div className="viz-gr-stamp">REDACT</div>
      <p className="viz-gr-hash">hmac 3f9a…c21e → a71c…09bd → 5be0…77f3</p>
    </div>
  );
}

export function MaddocVisual() {
  return (
    <div className="viz viz-md">
      <div className="viz-md-phone">
        <p className="viz-md-h">Find a doctor</p>
        <div className="viz-md-search">General Physician · Video</div>
        {[
          ["KR", "Dr. Kavya Raman", "Today 6:30 pm"],
          ["SQ", "Dr. Sana Qureshi", "Today 8:00 pm"],
          ["AM", "Dr. Arjun Mehta", "Tomorrow 11 am"],
        ].map(([i, n, s]) => (
          <div key={n} className="viz-md-doc">
            <span className="viz-md-av">{i}</span>
            <span>
              <b>{n}</b>
              <small>{s}</small>
            </span>
            <span className="viz-md-ok">✓</span>
          </div>
        ))}
      </div>
      <div className="viz-md-card">
        <p className="viz-md-h">Book · step 2 of 4</p>
        <div className="viz-md-steps">
          <i className="on" />
          <i className="on" />
          <i />
          <i />
        </div>
        <div className="viz-md-slots">
          {["10:00", "11:30", "6:30", "8:00"].map((s, k) => (
            <span key={s} className={k === 2 ? "on" : ""}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConceptSketch({ variant, className = "" }: { variant: "monolith" | "exo" | "arc"; className?: string }) {
  return (
    <svg viewBox="0 0 240 140" className={`sketch ${className}`} role="img" aria-label={`Abstract line sketch for the ${variant} direction (illustrative, not a design render)`}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="55" cy="110" r="21" />
        <circle cx="55" cy="110" r="7" opacity=".5" />
        <circle cx="188" cy="110" r="21" />
        <circle cx="188" cy="110" r="7" opacity=".5" />
        {variant === "monolith" && (
          <>
            <path d="M24 100 C22 80 32 64 52 62 L134 60 C144 60 148 66 148 74 L148 94 L168 94" />
            <path d="M54 57 L126 55" strokeWidth="3" />
            <path d="M168 94 L181 34" />
            <path d="M170 31 L198 28" />
            <path d="M160 96 C168 76 176 62 181 52" opacity=".55" />
          </>
        )}
        {variant === "exo" && (
          <>
            <path d="M42 98 L82 72 L150 94 L181 34" />
            <path d="M28 94 L46 70 L86 68 L74 94 Z" opacity=".7" />
            <path d="M96 76 L140 90" strokeDasharray="3 4" opacity=".6" />
            <path d="M58 64 L122 62" strokeWidth="3" />
            <path d="M120 94 L170 94" />
            <path d="M170 31 L198 28" />
            <circle cx="82" cy="72" r="2.5" />
            <circle cx="150" cy="94" r="2.5" />
          </>
        )}
        {variant === "arc" && (
          <>
            <path d="M22 98 C30 62 66 58 98 66 C118 72 124 96 148 96 C166 96 172 62 181 32" />
            <path d="M52 61 L104 62" strokeWidth="3" />
            <path d="M120 98 L160 98" opacity=".55" />
            <path d="M170 30 L198 27" />
          </>
        )}
        <circle cx="186" cy="44" r="3" className="sketch-lamp" />
      </g>
      <g className="sketch-anno" fontFamily="var(--f-mono)" fontSize="7" letterSpacing=".08em">
        <path d="M20 132 L220 132" stroke="currentColor" strokeWidth=".5" opacity=".5" />
        <text x="20" y="128" fill="currentColor" opacity=".6">
          ILLUSTRATIVE
        </text>
        <text x="220" y="128" fill="currentColor" opacity=".6" textAnchor="end">
          NOT TO SCALE
        </text>
      </g>
    </svg>
  );
}

export function DesignVisual() {
  return (
    <div className="viz viz-da">
      <div className="viz-da-board">
        {(["monolith", "exo", "arc"] as const).map((v, i) => (
          <figure key={v} className="viz-da-tile">
            <span className="label label--sm">DIR-{"ABC"[i]}</span>
            <ConceptSketch variant={v} />
          </figure>
        ))}
      </div>
      <div className="viz-da-row">
        <div className="viz-da-swatches" aria-hidden="true">
          <i className="sw-graphite" />
          <i className="sw-paper" />
          <i className="sw-signal" />
          <i className="sw-alu" />
          <i className="sw-pp" />
        </div>
        <ul className="viz-da-tasks">
          <li>
            <b>HIGH</b> Side-stand reach for shorter riders
          </li>
          <li>
            <b>MED</b> Simplify left switch cube
          </li>
        </ul>
      </div>
    </div>
  );
}

export function ProjectVisual({ id }: { id: string }) {
  if (id === "ipl") return <IplVisual />;
  if (id === "guardrail") return <GuardrailVisual />;
  if (id === "maddoc") return <MaddocVisual />;
  return <DesignVisual />;
}
