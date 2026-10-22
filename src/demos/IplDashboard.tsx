import { useEffect, useRef, useState, type FormEvent } from "react";
import { CornerDownLeft } from "lucide-react";
import { BATTING, BOWLING, MATCH, SEASONS, SUGGESTED_QUESTIONS } from "../data/mock/ipl";
import { ask, cumulative, phaseStats, PHASES, totals, turningPoints, UnsupportedQuestion, type Answer } from "../lib/ipl";
import { prefersReducedMotion } from "../lib/hooks";
import { FlowDiagram } from "../components/sections";

const [A, B] = MATCH.innings;

function SeasonChart() {
  const [hover, setHover] = useState<number | null>(null);
  const max = 200, min = 140;
  return (
    <div className="ipl-card">
      <div className="ipl-card-head">
        <h4 className="label label--sm">Season overview</h4>
        <span className="label label--sm ipl-muted">avg 1st-innings score</span>
      </div>
      <div className="season-bars" role="list">
        {SEASONS.map((s, i) => (
          <div
            key={s.season}
            role="listitem"
            className={`season-bar ${hover === i ? "is-hover" : ""}`}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            aria-label={`${s.season}: average first-innings score ${s.avgFirstInnings} across ${s.matches} matches`}
          >
            <span className="season-val tnum">{s.avgFirstInnings}</span>
            <i style={{ height: `${((s.avgFirstInnings - min) / (max - min)) * 100}%` }} />
            <span className="season-name">{s.season}</span>
          </div>
        ))}
      </div>
      <p className="ipl-foot ipl-muted">{hover !== null ? `${SEASONS[hover].season} · ${SEASONS[hover].matches} matches` : "S1–S6 are placeholder seasons"}</p>
    </div>
  );
}

function MetricCards() {
  const top = [...BATTING].sort((a, b) => b.runs - a.runs)[0];
  const eco = [...BOWLING].sort((a, b) => a.runs / a.overs - b.runs / b.overs)[0];
  const ta = totals(A), tb = totals(B);
  const cards = [
    { k: "Result", v: `${A.short} by ${ta.runs - tb.runs}`, s: `${ta.runs}/${ta.wickets} vs ${tb.runs}/${tb.wickets}` },
    { k: "Top bat", v: `${top.runs} (${top.balls})`, s: `${top.name} · SR ${((top.runs / top.balls) * 100).toFixed(1)}` },
    { k: "Best economy", v: (eco.runs / eco.overs).toFixed(2), s: `${eco.name} · ${eco.wickets}/${eco.runs}` },
    { k: "Sixes", v: String(BATTING.reduce((n, b) => n + b.sixes, 0)), s: "top-4 batters combined" },
  ];
  return (
    <div className="ipl-metrics">
      {cards.map((c) => (
        <div key={c.k} className="ipl-metric">
          <span className="label label--sm ipl-muted">{c.k}</span>
          <b className="tnum">{c.v}</b>
          <span className="ipl-muted">{c.s}</span>
        </div>
      ))}
    </div>
  );
}

function WormChart() {
  const W = 600, H = 250, P = { l: 36, r: 12, t: 14, b: 26 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const ca = [0, ...cumulative(A)], cb = [0, ...cumulative(B)];
  const x = (o: number) => P.l + (o / 20) * iw;
  const y = (r: number) => P.t + ih - (r / 200) * ih;
  const path = (c: number[]) => c.map((v, o) => `${o ? "L" : "M"}${x(o).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const [hover, setHover] = useState<number | null>(null);
  const collapse = turningPoints(B).find((t) => t.kind === "collapse");

  return (
    <div className="ipl-card ipl-card--worm">
      <div className="ipl-card-head">
        <h4 className="label label--sm">Run progression (worm)</h4>
        <span className="ipl-legend label label--sm">
          <i className="lg-a" /> {A.short} <i className="lg-b" /> {B.short}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="worm" role="img" aria-label={`Cumulative runs by over. ${A.team} reached ${ca[20]}, ${B.team} reached ${cb[20]}.`}>
        {[0, 50, 100, 150, 200].map((r) => (
          <g key={r}>
            <line x1={P.l} x2={W - P.r} y1={y(r)} y2={y(r)} className="worm-grid" />
            <text x={P.l - 8} y={y(r) + 3} className="worm-tick" textAnchor="end">
              {r}
            </text>
          </g>
        ))}
        {[0, 5, 10, 15, 20].map((o) => (
          <text key={o} x={x(o)} y={H - 8} className="worm-tick" textAnchor="middle">
            {o}
          </text>
        ))}
        {collapse && <rect x={x(collapse.over - 3)} width={x(3) - x(0)} y={P.t} height={ih} className="worm-band" />}
        {collapse && (
          <text x={x(collapse.over - 1.5)} y={P.t + 12} className="worm-band-label" textAnchor="middle">
            COLLAPSE
          </text>
        )}
        <path d={path(ca)} className="worm-a" />
        <path d={path(cb)} className="worm-b" />
        {[A, B].map((inn, k) =>
          inn.wicketsPerOver.map((w, o) =>
            w ? <circle key={`${k}-${o}`} cx={x(o + 1)} cy={y((k ? cb : ca)[o + 1])} r="3.5" className={k ? "worm-wk-b" : "worm-wk-a"} /> : null,
          ),
        )}
        {hover !== null && (
          <g className="worm-hover">
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + ih} />
            <rect x={Math.min(x(hover) + 8, W - 150)} y={P.t + 4} width="138" height="48" rx="3" />
            <text x={Math.min(x(hover) + 16, W - 142)} y={P.t + 22}>
              Over {hover} · {A.short} {ca[hover]}
            </text>
            <text x={Math.min(x(hover) + 16, W - 142)} y={P.t + 40}>
              {B.short} {cb[hover]} ({cb[hover] - ca[hover] >= 0 ? "+" : ""}
              {cb[hover] - ca[hover]})
            </text>
          </g>
        )}
        {Array.from({ length: 21 }, (_, o) => (
          <rect key={o} x={x(o) - iw / 40} width={iw / 20} y={P.t} height={ih} fill="transparent" onPointerEnter={() => setHover(o)} onPointerLeave={() => setHover(null)} />
        ))}
      </svg>
      <table className="sr-only">
        <caption>Cumulative runs by over</caption>
        <thead>
          <tr>
            <th>Over</th>
            <th>{A.team}</th>
            <th>{B.team}</th>
          </tr>
        </thead>
        <tbody>
          {ca.slice(1).map((v, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{v}</td>
              <td>{cb[i + 1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhaseChart() {
  const pa = phaseStats(A), pb = phaseStats(B);
  return (
    <div className="ipl-card">
      <div className="ipl-card-head">
        <h4 className="label label--sm">Phase-wise run rate</h4>
        <span className="ipl-legend label label--sm">
          <i className="lg-a" /> {A.short} <i className="lg-b" /> {B.short}
        </span>
      </div>
      <div className="phase-chart">
        {PHASES.map((p, i) => (
          <div key={p.phase} className="phase-group">
            <div className="phase-bars">
              {[pa[i], pb[i]].map((s, k) => (
                <div key={k} className={`phase-bar ${k ? "b" : "a"}`} style={{ height: `${(s.runRate / 14) * 100}%` }} aria-label={`${k ? B.team : A.team} ${p.phase}: ${s.runs} runs, run rate ${s.runRate}, ${s.wickets} wickets`}>
                  <span className="tnum">{s.runRate.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <span className="label label--sm ipl-muted">
              {p.phase} · ov {p.from + 1}–{p.to}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Timeline() {
  const events = [...turningPoints(A), ...turningPoints(B)].sort((a, b) => a.over - b.over);
  return (
    <div className="ipl-card ipl-card--timeline">
      <div className="ipl-card-head">
        <h4 className="label label--sm">Turning points · detected by rules</h4>
        <span className="label label--sm ipl-muted">collapse = 3+ wkts in 3 overs · big over = 13+ runs</span>
      </div>
      <div className="tl-axis" aria-hidden="true">
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <ol className="tl-events">
        {events.map((e, i) => (
          <li key={i} className={`tl-event tl-${e.kind} tl-team-${e.team === A.short ? "a" : "b"}`} style={{ ["--x" as string]: `${((e.over - 0.5) / 20) * 100}%` }}>
            <span className="tl-pin" aria-hidden="true" />
            <span className="tl-text">
              <b>
                {e.team} · ov {e.over}
              </b>{" "}
              {e.text}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const TRACE = [
  { label: "Question", sub: "natural language" },
  { label: "Intent routing", sub: "deterministic parser", tone: "code" as const },
  { label: "Validated tool", sub: "analytics function", tone: "code" as const },
  { label: "Structured result", sub: "typed rows" },
  { label: "Interpretation", sub: "explains only", tone: "ai" as const },
];

function AskPanel() {
  const [q, setQ] = useState("");
  const [state, setState] = useState<{ kind: "empty" } | { kind: "running"; step: number; q: string } | { kind: "done"; a: Answer; q: string } | { kind: "error"; msg: string; q: string }>({ kind: "empty" });
  const timer = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => () => clearInterval(timer.current), []);

  const run = (question: string) => {
    clearInterval(timer.current);
    let result: Answer | null = null;
    let error = "";
    try {
      result = ask(question);
    } catch (e) {
      error = e instanceof UnsupportedQuestion ? e.message : "Something went wrong.";
    }
    if (prefersReducedMotion()) {
      setState(result ? { kind: "done", a: result, q: question } : { kind: "error", msg: error, q: question });
      return;
    }
    let step = 0;
    setState({ kind: "running", step, q: question });
    timer.current = setInterval(() => {
      step++;
      if (!result && step >= 2) {
        clearInterval(timer.current);
        setState({ kind: "error", msg: error, q: question });
      } else if (step >= TRACE.length) {
        clearInterval(timer.current);
        setState({ kind: "done", a: result!, q: question });
      } else setState({ kind: "running", step, q: question });
    }, 260);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(q);
  };

  return (
    <div className="ipl-card ipl-ask">
      <div className="ipl-card-head">
        <h4 className="label label--sm">Ask the data</h4>
        <span className="label label--sm ipl-muted">deterministic-first routing</span>
      </div>
      <form onSubmit={submit} className="ask-form">
        <label htmlFor="ipl-q" className="sr-only">
          Ask a question about the sample match
        </label>
        <span className="prompt-mark" aria-hidden="true">
          &gt;
        </span>
        <input id="ipl-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Where did the chase turn?" autoComplete="off" maxLength={160} />
        <button type="submit" className="ask-submit" aria-label="Run question">
          <CornerDownLeft aria-hidden="true" strokeWidth={1.5} />
        </button>
      </form>
      <div className="chips ask-chips">
        {SUGGESTED_QUESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            onClick={() => {
              setQ(s);
              run(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <FlowDiagram steps={TRACE} active={state.kind === "running" ? state.step : state.kind === "done" ? TRACE.length - 1 : state.kind === "error" ? 1 : undefined} />
      <div className="ask-out" aria-live="polite">
        {state.kind === "empty" && <p className="ipl-muted">Pick a question or type your own. Answers come from functions over the sample data — the explanation only restates computed numbers.</p>}
        {state.kind === "running" && (
          <p className="ipl-muted">
            {TRACE[state.step].label.toLowerCase()}…<span className="caret">▍</span>
          </p>
        )}
        {state.kind === "error" && (
          <div className="ask-error" role="alert">
            <span className="label label--sm">No validated tool</span>
            <p>{state.msg}</p>
          </div>
        )}
        {state.kind === "done" && (
          <div className="ask-answer">
            <p className="ask-trace label label--sm">
              intent={state.a.intent} · {state.a.tool}
            </p>
            <table className="ask-table">
              <tbody>
                {state.a.rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td className="tnum">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="ask-narrative">{state.a.narrative}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function IplDashboard() {
  return (
    <div className="demo ipl reg">
      <div className="demo-bar">
        <span className="label label--sm">IPL Intelligence · portfolio demonstration</span>
        <span className="demo-tag">Representative data · fictional teams</span>
      </div>
      <div className="ipl-head">
        <div>
          <p className="label label--sm ipl-muted">Match · {MATCH.venue}</p>
          <h3 className="h3">{MATCH.title}</h3>
        </div>
      </div>
      <MetricCards />
      <div className="ipl-grid">
        <WormChart />
        <PhaseChart />
        <SeasonChart />
        <AskPanel />
        <Timeline />
      </div>
    </div>
  );
}
