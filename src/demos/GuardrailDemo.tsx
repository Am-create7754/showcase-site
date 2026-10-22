import { useRef, useState, type ReactNode } from "react";
import { Check, Play, ShieldAlert, ShieldCheck, ShieldX, Hourglass, X } from "lucide-react";
import { POLICY_TABLE, ROLES, SAMPLE_PROMPTS, SEED_EVENTS, USERS, type AuditEvent } from "../data/mock/guardrail";
import { chainHash, inspect, type Decision, type Finding, type Inspection, type Role } from "../lib/guardrail";
import { prefersReducedMotion } from "../lib/hooks";
import { FlowDiagram } from "../components/sections";

const DECISION_META: Record<Decision, { icon: typeof ShieldCheck; text: string }> = {
  ALLOW: { icon: ShieldCheck, text: "Forwarded unchanged" },
  REDACT: { icon: ShieldAlert, text: "Forwarded with sensitive items removed" },
  HOLD: { icon: Hourglass, text: "Held until an administrator approves" },
  BLOCK: { icon: ShieldX, text: "Not forwarded" },
};

const PIPE = [
  { label: "Prompt", sub: "from user / extension" },
  { label: "Inspection", sub: "pattern + code rules", tone: "code" as const },
  { label: "Policy decision", sub: "by role & severity", tone: "code" as const },
  { label: "Redact / hold / block", sub: "transform or stop" },
  { label: "Audit event", sub: "HMAC-chained", tone: "human" as const },
];

const now = () => new Date().toTimeString().slice(0, 5);

function Highlighted({ text, findings }: { text: string; findings: Finding[] }) {
  const spans = findings.filter((f) => f.start >= 0).sort((a, b) => a.start - b.start);
  const out: ReactNode[] = [];
  let i = 0;
  spans.forEach((f, k) => {
    if (f.start > i) out.push(text.slice(i, f.start));
    out.push(
      <mark key={k} className={`hl hl--${f.severity}`} title={f.label}>
        {text.slice(f.start, f.end)}
      </mark>,
    );
    i = f.end;
  });
  out.push(text.slice(i));
  return <>{out}</>;
}

function Transformed({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[REDACTED:[A-Z-]+\])/).map((part, i) =>
        part.startsWith("[REDACTED:") ? (
          <span key={i} className="redaction">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

interface Pending {
  id: string;
  user: string;
  reason: string;
  status: "pending" | "approved" | "denied";
}

export function GuardrailDemo() {
  const [view, setView] = useState<"dev" | "admin">("dev");
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0].text);
  const [role, setRole] = useState<Role>("engineer");
  const [step, setStep] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<(Inspection & { original: string; event: AuditEvent }) | null>(null);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<(AuditEvent & { full?: string })[]>(SEED_EVENTS);
  const [pending, setPending] = useState<Pending[]>([
    { id: "ev-1043", user: "ctr.charlie", reason: "Source code from contractor account", status: "pending" },
    { id: "ev-1046", user: "ctr.foxtrot", reason: "Payment card number", status: "pending" },
  ]);
  const seq = useRef(1047);
  const running = step !== undefined && !result;

  const addEvent = async (e: Omit<AuditEvent, "hash" | "id" | "time" | "source">) => {
    const id = `ev-${seq.current++}`;
    const prev = [...events].reverse().find((x) => x.full)?.full ?? "seed-chain-head";
    const full = await chainHash(prev, JSON.stringify({ id, ...e }));
    const ev = { ...e, id, time: now(), source: "session" as const, hash: full ? `${full.slice(0, 4)}…${full.slice(-4)}` : "unavailable", full: full ?? undefined };
    setEvents((list) => [...list, ev]);
    return ev;
  };

  const run = async () => {
    if (!prompt.trim()) {
      setError("Enter a prompt to inspect.");
      return;
    }
    setError("");
    setResult(null);
    const r = inspect(prompt, role);
    const ev = await addEvent({ user: role === "contractor" ? "ctr.you" : role === "security-admin" ? "sec.you" : "dev.you", role, decision: r.decision, rules: [...new Set(r.findings.map((f) => f.rule))] });
    if (r.decision === "HOLD") setPending((p) => [{ id: ev.id, user: ev.user, reason: r.findings.map((f) => f.label).join(", "), status: "pending" }, ...p]);
    const finish = () => setResult({ ...r, original: prompt, event: ev });
    if (prefersReducedMotion()) {
      setStep(PIPE.length - 1);
      finish();
      return;
    }
    let s = 0;
    setStep(0);
    const t = setInterval(() => {
      s++;
      setStep(s);
      if (s >= PIPE.length - 1) {
        clearInterval(t);
        finish();
      }
    }, 300);
  };

  const resolve = async (id: string, approve: boolean) => {
    setPending((p) => p.map((x) => (x.id === id ? { ...x, status: approve ? "approved" : "denied" } : x)));
    const item = pending.find((x) => x.id === id);
    await addEvent({ user: "sec.admin", role: "security-admin", decision: approve ? "REDACT" : "BLOCK", rules: [`review:${id}`, item ? item.user : ""].filter(Boolean) });
  };

  const counts = (["ALLOW", "REDACT", "HOLD", "BLOCK"] as Decision[]).map((d) => ({ d, n: events.filter((e) => e.decision === d).length }));
  const maxCount = Math.max(1, ...counts.map((c) => c.n));
  const openPending = pending.filter((p) => p.status === "pending").length;

  return (
    <div className="demo gr reg">
      <div className="demo-bar">
        <span className="label label--sm">AppSec Guardrail · portfolio demonstration</span>
        <span className="demo-tag">Synthetic data · local rules · no backend</span>
      </div>

      <div className="gr-tabs" role="tablist" aria-label="Workspace">
        <button type="button" role="tab" id="tab-dev" aria-controls="panel-dev" aria-selected={view === "dev"} tabIndex={view === "dev" ? 0 : -1} onClick={() => setView("dev")} onKeyDown={(e) => e.key === "ArrowRight" && (setView("admin"), document.getElementById("tab-admin")?.focus())}>
          Developer workspace
        </button>
        <button type="button" role="tab" id="tab-admin" aria-controls="panel-admin" aria-selected={view === "admin"} tabIndex={view === "admin" ? 0 : -1} onClick={() => setView("admin")} onKeyDown={(e) => e.key === "ArrowLeft" && (setView("dev"), document.getElementById("tab-dev")?.focus())}>
          Administrator workspace {openPending > 0 && <span className="gr-count">{openPending}</span>}
        </button>
      </div>

      {view === "dev" ? (
        <div role="tabpanel" id="panel-dev" aria-labelledby="tab-dev" className="gr-panel">
          <div className="gr-dev">
            <div className="gr-input">
              <div className="chips">
                <span className="label label--sm gr-muted">Samples:</span>
                {SAMPLE_PROMPTS.map((s) => (
                  <button key={s.label} type="button" className="chip" aria-pressed={prompt === s.text} onClick={() => setPrompt(s.text)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="gr-field">
                <span className="label label--sm gr-muted">Prompt to an external AI tool</span>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} maxLength={1500} spellCheck={false} />
              </label>
              <div className="gr-controls">
                <label className="gr-field gr-field--inline">
                  <span className="label label--sm gr-muted">User role</span>
                  <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className="btn btn--primary" onClick={run} disabled={running}>
                  <Play aria-hidden="true" strokeWidth={1.5} /> {running ? "Inspecting…" : "Run safe check"}
                </button>
              </div>
              {error && (
                <p className="gr-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <FlowDiagram steps={PIPE} active={step} />
          </div>

          <div className="gr-result" aria-live="polite">
            {!result ? (
              <p className="gr-muted gr-empty">{running ? "Inspecting prompt…" : "Run a safe check to see detected items, the policy decision and the audit event."}</p>
            ) : (
              <>
                <div className={`gr-decision gr-decision--${result.decision.toLowerCase()}`}>
                  {(() => {
                    const Icon = DECISION_META[result.decision].icon;
                    return <Icon aria-hidden="true" strokeWidth={1.5} />;
                  })()}
                  <div>
                    <p className="label label--sm">Final decision</p>
                    <p className="gr-decision-word">{result.decision}</p>
                    <p>{DECISION_META[result.decision].text}</p>
                  </div>
                  <div className="gr-why">
                    <p className="label label--sm">Why</p>
                    {result.reasons.map((r) => (
                      <p key={r}>{r}</p>
                    ))}
                  </div>
                </div>

                <div className="gr-findings">
                  <p className="label label--sm gr-muted">Detected sensitive items · {result.findings.length}</p>
                  {result.findings.length === 0 ? (
                    <p className="gr-muted">None detected by the active rules.</p>
                  ) : (
                    <ul>
                      {result.findings.map((f, i) => (
                        <li key={i}>
                          <span className={`sev sev--${f.severity}`}>{f.severity}</span>
                          <span>{f.label}</span>
                          <code>{f.preview}</code>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="gr-compare">
                  <figure>
                    <figcaption className="label label--sm gr-muted">Original prompt</figcaption>
                    <pre>
                      <Highlighted text={result.original} findings={result.findings} />
                    </pre>
                  </figure>
                  <figure>
                    <figcaption className="label label--sm gr-muted">What leaves the organisation</figcaption>
                    {result.decision === "BLOCK" ? (
                      <pre className="gr-blocked">Nothing. The request was stopped before forwarding (fail-closed).</pre>
                    ) : result.decision === "HOLD" ? (
                      <pre className="gr-held">
                        Held in the approval queue as {result.event.id}. If approved, this redacted version is sent:
                        {"\n\n"}
                        <Transformed text={result.redacted} />
                      </pre>
                    ) : (
                      <pre>
                        <Transformed text={result.redacted} />
                      </pre>
                    )}
                  </figure>
                </div>

                <p className="gr-audit label label--sm">
                  Audit event {result.event.id} · {result.event.time} · hmac {result.event.hash} · chained to previous event
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div role="tabpanel" id="panel-admin" aria-labelledby="tab-admin" className="gr-panel gr-admin">
          <div className="gr-overview">
            <div className="gr-stat">
              <span className="label label--sm gr-muted">Events today</span>
              <b className="tnum">{events.length}</b>
            </div>
            <div className="gr-stat">
              <span className="label label--sm gr-muted">Pending approvals</span>
              <b className="tnum">{openPending}</b>
            </div>
            <div className="gr-stat">
              <span className="label label--sm gr-muted">Blocked</span>
              <b className="tnum">{counts[3].n}</b>
            </div>
            <div className="gr-stat gr-stat--bars">
              <span className="label label--sm gr-muted">Policy decisions</span>
              {counts.map((c) => (
                <div key={c.d} className="gr-bar">
                  <span>{c.d}</span>
                  <i style={{ width: `${(c.n / maxCount) * 100}%` }} className={`gr-bar--${c.d.toLowerCase()}`} />
                  <b className="tnum">{c.n}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="gr-admin-grid">
            <section className="gr-box" aria-labelledby="gr-pending-h">
              <h4 id="gr-pending-h" className="label label--sm">
                Pending approvals
              </h4>
              {pending.length === 0 ? (
                <p className="gr-muted">Queue is empty.</p>
              ) : (
                <ul className="gr-pending">
                  {pending.map((p) => (
                    <li key={p.id}>
                      <div>
                        <b>{p.id}</b> · {p.user}
                        <p className="gr-muted">{p.reason}</p>
                      </div>
                      {p.status === "pending" ? (
                        <div className="gr-actions">
                          <button type="button" className="btn btn--sm" onClick={() => resolve(p.id, true)} aria-label={`Approve ${p.id} with redaction`}>
                            <Check aria-hidden="true" strokeWidth={1.5} /> Approve
                          </button>
                          <button type="button" className="btn btn--sm" onClick={() => resolve(p.id, false)} aria-label={`Deny ${p.id}`}>
                            <X aria-hidden="true" strokeWidth={1.5} /> Deny
                          </button>
                        </div>
                      ) : (
                        <span className={`sev ${p.status === "approved" ? "sev--low" : "sev--critical"}`}>{p.status}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="gr-box" aria-labelledby="gr-policy-h">
              <h4 id="gr-policy-h" className="label label--sm">
                Active policy
              </h4>
              <div className="table-scroll">
                <table className="gr-table">
                  <thead>
                    <tr>
                      <th scope="col">Rule</th>
                      <th scope="col">Engineer</th>
                      <th scope="col">Contractor</th>
                      <th scope="col">Sec. admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POLICY_TABLE.map((r) => (
                      <tr key={r.rule}>
                        <th scope="row">
                          {r.rule}
                          <span className="gr-muted"> · {r.severity}</span>
                        </th>
                        {[r.engineer, r.contractor, r.admin].map((d, i) => (
                          <td key={i}>
                            <span className={`dchip dchip--${d.toLowerCase()}`}>{d}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="gr-box gr-box--wide" aria-labelledby="gr-audit-h">
              <h4 id="gr-audit-h" className="label label--sm">
                Audit log · newest first
              </h4>
              <div className="table-scroll">
                <table className="gr-table">
                  <thead>
                    <tr>
                      <th scope="col">Event</th>
                      <th scope="col">Time</th>
                      <th scope="col">User</th>
                      <th scope="col">Decision</th>
                      <th scope="col">Rules</th>
                      <th scope="col">HMAC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...events].reverse().map((e) => (
                      <tr key={e.id} className={e.source === "session" ? "is-new" : ""}>
                        <td className="tnum">{e.id}</td>
                        <td className="tnum">{e.time}</td>
                        <td>{e.user}</td>
                        <td>
                          <span className={`dchip dchip--${e.decision.toLowerCase()}`}>{e.decision}</span>
                        </td>
                        <td>{e.rules.length ? e.rules.join(", ") : "—"}</td>
                        <td className="tnum">{e.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="gr-muted gr-small">Session events are chained with HMAC-SHA256 computed in your browser using a demo key. Seed rows show placeholder hashes.</p>
            </section>

            <section className="gr-box gr-box--wide" aria-labelledby="gr-users-h">
              <h4 id="gr-users-h" className="label label--sm">
                Users
              </h4>
              <div className="table-scroll">
                <table className="gr-table">
                  <thead>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col">Role</th>
                      <th scope="col">Team</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {USERS.map((u) => (
                      <tr key={u.user}>
                        <td>{u.user}</td>
                        <td>{u.role}</td>
                        <td>{u.team}</td>
                        <td>{u.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
