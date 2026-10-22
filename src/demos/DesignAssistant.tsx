import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardCopy, ListChecks, RotateCcw, Sparkles, Star } from "lucide-react";
import { CMF_COMBOS, CONCEPTS, SAMPLE_BRIEF, SAMPLE_FEEDBACK, SWATCHES } from "../data/mock/design";
import {
  BRIEF_FIELDS,
  briefCompleteness,
  organizeBrief,
  organizeFeedback,
  summarize,
  type Brief,
  type OrganizedBrief,
  type Task,
} from "../lib/designAssistant";
import { prefersReducedMotion } from "../lib/hooks";
import { ConceptSketch } from "../components/visuals";

const swatch = (id: string) => SWATCHES.find((s) => s.id === id)!;
const EMPTY: Brief = { projectName: "", category: "", targetUser: "", goals: "", constraints: "", references: "" };

function useFakeLatency() {
  const t = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(t.current), []);
  return (fn: () => void, ms = 650) => {
    clearTimeout(t.current);
    if (prefersReducedMotion()) fn();
    else t.current = setTimeout(fn, ms);
  };
}

function PanelHead({ id, letter, title, hint }: { id: string; letter: string; title: string; hint: string }) {
  return (
    <div className="da-panel-head">
      <span className="da-letter">{letter}</span>
      <div>
        <h3 id={id} className="h3">{title}</h3>
        <p className="muted">{hint}</p>
      </div>
    </div>
  );
}

export function DesignAssistant() {
  const [brief, setBrief] = useState<Brief>(SAMPLE_BRIEF);
  const [organized, setOrganized] = useState<OrganizedBrief | null>(null);
  const [briefBusy, setBriefBusy] = useState(false);
  const [briefError, setBriefError] = useState("");
  const [resolved, setResolved] = useState<string[]>([]);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [cmf, setCmf] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(SAMPLE_FEEDBACK);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fbBusy, setFbBusy] = useState(false);
  const [fbError, setFbError] = useState("");
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const delay = useFakeLatency();
  const delay2 = useFakeLatency();

  const summary = useMemo(
    () => summarize({ brief, organized, resolvedQuestions: resolved, shortlisted, cmfSelection: cmf, tasks }),
    [brief, organized, resolved, shortlisted, cmf, tasks],
  );

  const runBrief = () => {
    if (!brief.goals.trim() || !brief.constraints.trim()) {
      setBriefError("Add at least design goals and functional constraints before organizing.");
      return;
    }
    setBriefError("");
    setBriefBusy(true);
    delay(() => {
      setOrganized(organizeBrief(brief));
      setResolved([]);
      setBriefBusy(false);
    });
  };

  const runFeedback = () => {
    if (feedback.trim().length < 5) {
      setFbError("Add at least one review comment — one per line.");
      return;
    }
    setFbError("");
    setFbBusy(true);
    delay2(() => {
      setTasks(organizeFeedback(feedback));
      setFbBusy(false);
    });
  };

  const copySummary = async () => {
    const lines = [
      `# ${brief.projectName || "Untitled project"} — workflow summary`,
      `Brief completeness: ${summary.completeness}%`,
      `Outstanding questions: ${summary.outstandingQuestions}`,
      `Open review tasks: ${summary.openTasks} (${summary.highPriorityOpen} high priority)`,
      `Shortlisted directions: ${shortlisted.map((id) => CONCEPTS.find((c) => c.id === id)?.name).join(", ") || "none"}`,
      `CMF direction: ${CMF_COMBOS.find((c) => c.id === cmf)?.name ?? "none"}`,
      "",
      "## Next steps",
      ...summary.nextSteps.map((s) => `- ${s}`),
      ...(tasks.length ? ["", "## Review tasks", ...tasks.map((t) => `- [${t.done ? "x" : " "}] (${t.priority}, ${t.category}) ${t.text}`)] : []),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    setTimeout(() => setCopied(""), 2200);
  };

  const completeness = briefCompleteness(brief);

  return (
    <div className="da">
      <div className="da-main">
        {/* A — Brief intake */}
        <section className="da-panel" aria-labelledby="da-a">
          <PanelHead id="da-a" letter="A" title="Design brief intake" hint="A fictional brief, prefilled. Edit anything — every panel below reacts to it." />
          <form
            className="da-form"
            onSubmit={(e) => {
              e.preventDefault();
              runBrief();
            }}
          >
            {BRIEF_FIELDS.map((f) => (
              <label key={f.key} className={`da-field ${f.multiline ? "da-field--wide" : ""}`}>
                <span className="label label--sm">
                  {f.label}
                  {brief[f.key].trim().length >= 3 ? <Check aria-label="filled" strokeWidth={2} className="da-ok" /> : <span className="da-missing"> · missing</span>}
                </span>
                {f.multiline ? (
                  <textarea value={brief[f.key]} rows={f.key === "targetUser" || f.key === "references" ? 3 : 4} onChange={(e) => setBrief({ ...brief, [f.key]: e.target.value })} />
                ) : (
                  <input value={brief[f.key]} onChange={(e) => setBrief({ ...brief, [f.key]: e.target.value })} />
                )}
              </label>
            ))}
            <div className="da-actions">
              <button type="submit" className="btn btn--primary" disabled={briefBusy}>
                <Sparkles aria-hidden="true" strokeWidth={1.5} /> {briefBusy ? "Organizing…" : "Organize brief"}
              </button>
              <button type="button" className="btn btn--sm" onClick={() => (setBrief(SAMPLE_BRIEF), setOrganized(null))}>
                <RotateCcw aria-hidden="true" strokeWidth={1.5} /> Reset sample
              </button>
              <button type="button" className="btn btn--sm" onClick={() => (setBrief(EMPTY), setOrganized(null))}>
                Clear
              </button>
              <span className="label label--sm muted da-complete">Completeness {completeness}%</span>
            </div>
            {briefError && (
              <p className="da-error" role="alert">
                {briefError}
              </p>
            )}
          </form>
        </section>

        {/* B — Brief to requirements */}
        <section className="da-panel" aria-labelledby="da-b" aria-busy={briefBusy}>
          <PanelHead id="da-b" letter="B" title="Brief → requirements" hint="Structured by local rules: split, classify, and check for topics the brief never mentions." />
          {briefBusy ? (
            <div className="da-skeleton" role="status">
              <span className="sr-only">Organizing brief</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <i key={i} />
              ))}
            </div>
          ) : !organized ? (
            <p className="da-empty">Nothing organized yet. Press “Organize brief” above.</p>
          ) : (
            <div className="da-req">
              {(
                [
                  ["Core goals", organized.coreGoals],
                  ["Functional constraints", organized.constraints],
                  ["User needs", organized.userNeeds],
                  ["Evaluation criteria", organized.criteria],
                ] as const
              ).map(([title, items]) => (
                <div key={title} className="da-req-col">
                  <p className="label label--sm">
                    {title} <span className="muted">· {items.length}</span>
                  </p>
                  {items.length ? (
                    <ul>
                      {items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">None found in the brief.</p>
                  )}
                </div>
              ))}
              <div className="da-req-col da-req-q">
                <p className="label label--sm">
                  Open questions <span className="muted">· {organized.openQuestions.length - resolved.length} open</span>
                </p>
                <ul>
                  {organized.openQuestions.map((q) => (
                    <li key={q}>
                      <label className="da-check">
                        <input type="checkbox" checked={resolved.includes(q)} onChange={() => setResolved((r) => (r.includes(q) ? r.filter((x) => x !== q) : [...r, q]))} />
                        <span className={resolved.includes(q) ? "is-done" : ""}>{q}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* C — Concept exploration */}
        <section className="da-panel da-panel--board" aria-labelledby="da-c">
          <PanelHead id="da-c" letter="C" title="Concept exploration board" hint="Three fictional directions. Sketches are abstract illustrations, not design renders." />
          <div className="da-concepts">
            {CONCEPTS.map((c) => {
              const on = shortlisted.includes(c.id);
              return (
                <article key={c.id} className={`da-concept reg ${on ? "is-on" : ""}`}>
                  <span className="reg-mark tl" aria-hidden="true" />
                  <span className="reg-mark br" aria-hidden="true" />
                  <div className="da-concept-top label label--sm">
                    <span>{c.code}</span>
                    <span className="muted">REF · ILLUSTRATIVE</span>
                  </div>
                  <div className="da-concept-art">
                    <ConceptSketch variant={c.variant} />
                  </div>
                  <h4 className="h3">{c.name}</h4>
                  <p className="da-rationale">{c.rationale}</p>
                  <p className="da-objective">
                    <span className="label label--sm">UX objective</span>
                    {c.objective}
                  </p>
                  <div className="da-tradeoffs">
                    <ul>
                      {c.pros.map((x) => (
                        <li key={x} className="pro">
                          + {x}
                        </li>
                      ))}
                    </ul>
                    <ul>
                      {c.cons.map((x) => (
                        <li key={x} className="con">
                          − {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button type="button" className={`btn btn--sm ${on ? "btn--primary" : ""}`} aria-pressed={on} onClick={() => setShortlisted((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}>
                    <Star aria-hidden="true" strokeWidth={1.5} /> {on ? "Shortlisted" : "Shortlist"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* D — CMF */}
        <section className="da-panel" aria-labelledby="da-d">
          <PanelHead id="da-d" letter="D" title="Colour, material & finish" hint="Conceptual explorations only — not engineering-approved specifications." />
          <div className="da-swatches">
            {SWATCHES.map((s) => (
              <figure key={s.id} className="da-swatch">
                <i className={s.className} aria-hidden="true" />
                <figcaption>
                  <b>{s.name}</b>
                  <span className="label label--sm muted">{s.finish}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="da-combos" role="radiogroup" aria-label="CMF combinations">
            {CMF_COMBOS.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={cmf === c.id} className={`da-combo ${cmf === c.id ? "is-on" : ""}`} onClick={() => setCmf(cmf === c.id ? null : c.id)}>
                <span className="da-combo-preview" aria-hidden="true">
                  <i className={`body ${swatch(c.body).className}`} />
                  <i className={`trim ${swatch(c.trim).className}`} />
                  <i className={`accent ${swatch(c.accent).className}`} />
                </span>
                <span className="da-combo-text">
                  <b>{c.name}</b>
                  <span className="label label--sm muted">
                    Body {swatch(c.body).name} · Trim {swatch(c.trim).name} · Accent {swatch(c.accent).name}
                  </span>
                  <span className="da-combo-note">{c.note}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* E — Feedback to actions */}
        <section className="da-panel" aria-labelledby="da-e" aria-busy={fbBusy}>
          <PanelHead id="da-e" letter="E" title="Review feedback → actions" hint="One comment per line. Categories and priorities come from keyword rules you can read in the source." />
          <div className="da-feedback">
            <label className="da-field da-field--wide">
              <span className="label label--sm">Reviewer comments</span>
              <textarea rows={7} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </label>
            <div className="da-actions">
              <button type="button" className="btn btn--primary" onClick={runFeedback} disabled={fbBusy}>
                <ListChecks aria-hidden="true" strokeWidth={1.5} /> {fbBusy ? "Organizing…" : "Organize feedback"}
              </button>
              <button type="button" className="btn btn--sm" onClick={() => (setFeedback(SAMPLE_FEEDBACK), setTasks([]))}>
                <RotateCcw aria-hidden="true" strokeWidth={1.5} /> Reset sample
              </button>
            </div>
            {fbError && (
              <p className="da-error" role="alert">
                {fbError}
              </p>
            )}
          </div>
          {fbBusy ? (
            <div className="da-skeleton" role="status">
              <span className="sr-only">Organizing feedback</span>
              {[0, 1, 2].map((i) => (
                <i key={i} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <p className="da-empty">No tasks yet. Organize the comments above to turn them into a prioritised list.</p>
          ) : (
            <ul className="da-tasks">
              {tasks.map((t) => (
                <li key={t.id} className={t.done ? "is-done" : ""}>
                  <label className="da-check">
                    <input type="checkbox" checked={t.done} onChange={() => setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} />
                    <span className="sr-only">Mark done:</span>
                  </label>
                  <span className={`prio prio--${t.priority.toLowerCase()}`}>{t.priority}</span>
                  <div>
                    <p className="da-task-text">{t.text}</p>
                    <p className="muted da-task-next">
                      <span className="label label--sm">{t.category}</span> ↳ {t.nextStep}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* F — Workflow summary */}
      <aside className="da-summary" aria-labelledby="da-f">
        <div className="da-summary-inner">
          <p className="label label--sm">
            <span className="da-letter da-letter--sm">F</span> Workflow summary
          </p>
          <h3 id="da-f" className="sr-only">
            Workflow summary
          </h3>
          <div className="da-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.completeness} aria-label="Brief completeness">
            <div className="da-meter-top">
              <span>Brief completeness</span>
              <b className="tnum">{summary.completeness}%</b>
            </div>
            <span className="da-meter-track">
              <i style={{ width: `${summary.completeness}%` }} />
            </span>
          </div>
          <dl className="da-stats">
            <div>
              <dt>Outstanding questions</dt>
              <dd className="tnum">{organized ? summary.outstandingQuestions : "—"}</dd>
            </div>
            <div>
              <dt>Open review tasks</dt>
              <dd className="tnum">{summary.openTasks}</dd>
            </div>
            <div>
              <dt>High priority open</dt>
              <dd className="tnum hot">{summary.highPriorityOpen}</dd>
            </div>
            <div>
              <dt>Shortlisted</dt>
              <dd>{shortlisted.length ? shortlisted.map((id) => CONCEPTS.find((c) => c.id === id)?.name).join(", ") : "—"}</dd>
            </div>
            <div>
              <dt>CMF</dt>
              <dd>{CMF_COMBOS.find((c) => c.id === cmf)?.name ?? "—"}</dd>
            </div>
          </dl>
          <p className="label label--sm muted">Next steps</p>
          <ol className="da-next">
            {summary.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <button type="button" className="btn btn--sm da-copy" onClick={copySummary}>
            <ClipboardCopy aria-hidden="true" strokeWidth={1.5} /> {copied === "ok" ? "Copied as Markdown" : copied === "fail" ? "Clipboard blocked" : "Copy summary"}
          </button>
          <p className="da-foot muted">Every number here is computed from this page's current state — no productivity claims.</p>
        </div>
      </aside>
    </div>
  );
}
