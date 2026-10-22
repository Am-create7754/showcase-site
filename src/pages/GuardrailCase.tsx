import { projectBySlug } from "../data/projects";
import { useMeta } from "../lib/hooks";
import { CaseHero, CaseNav, CaseSection, Evidence, NextSteps, RepoLink, ScopeTable } from "../components/case";
import { CountUp, Reveal } from "../components/motion";
import { FlowDiagram } from "../components/sections";
import { GuardrailDemo } from "../demos/GuardrailDemo";

const p = projectBySlug("shadow-ai-guardrail")!;

const LAYERS = [
  { n: "L1", title: "Guardrail gateway", text: "An OpenAI-compatible proxy built with Python and FastAPI. Tools keep calling a familiar API; every request passes through inspection first." },
  { n: "L2", title: "Policy engine", text: "Detects source code, credentials, personal and financial data, and confidential material — then allows, redacts, holds for approval, or blocks." },
  { n: "L3", title: "Tamper-evident audit", text: "Each event is chained with HMAC-SHA256, and the chain is periodically signed with Ed25519, so edits to history are detectable." },
  { n: "L4", title: "Dashboard + browser extension", text: "A React/TypeScript dashboard for admins and a Chrome/Edge (Manifest V3) extension that inspects prompts and uploads on supported AI sites." },
];

export default function GuardrailCase() {
  useMeta(
    "Autonomous AppSec Guardrail",
    "Case study: a guardrail that inspects AI traffic before it leaves an organisation, applying allow / redact / hold / block policies with a tamper-evident audit log.",
  );
  return (
    <article>
      <CaseHero
        project={p}
        title="A safety layer for *everyday* AI use."
        summary="People paste code, credentials and customer details into AI tools without meaning to. This system inspects that traffic before it is sent, applies organisational policy, and records every decision in an audit trail that can't be quietly edited."
      />

      <CaseSection n="01" label="Problem" title="The leak is usually an *accident*.">
        <div className="two-col">
          <div className="two-col-aside">
            <p>Shadow AI: tools adopted by individuals faster than an organisation can review them.</p>
          </div>
          <div className="two-col-main body-text">
            <p>
              An engineer debugging a failing request pastes the whole snippet — API key included. A support agent asks a chatbot to rewrite a reply and includes the customer's phone
              number. Neither person is being careless on purpose; the workflow just makes it easy.
            </p>
            <p>
              Banning AI tools pushes the behaviour out of sight. The goal here was the opposite: keep the tools usable, but put an inspection step between the person and the external model.
            </p>
          </div>
        </div>
      </CaseSection>

      <CaseSection n="02" label="Solution" title="Four layers, one *decision*." className="case-section--surface">
        <div className="layers">
          {LAYERS.map((l, i) => (
            <Reveal key={l.n} className="layer" delay={i * 70}>
              <span className="label signal">{l.n}</span>
              <h3 className="h4">{l.title}</h3>
              <p className="muted">{l.text}</p>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: 56 }}>
          <FlowDiagram
            steps={[
              { label: "Prompt", sub: "from tool or browser" },
              { label: "Inspection", sub: "request and streamed response", tone: "code" },
              { label: "Policy decision", sub: "role × severity", tone: "code" },
              { label: "Redact / approve / block", sub: "fail-closed on errors" },
              { label: "Audit event", sub: "HMAC chain + Ed25519", tone: "human" },
            ]}
            caption="Responses are inspected too — including streamed output — for sensitive data and insecure code"
          />
        </div>
      </CaseSection>

      <section className="case-section case-section--dark" aria-labelledby="gr-demo-h">
        <div className="wrap">
          <p className="sec-label label">
            <b>§ 03</b> — Interactive demo
          </p>
          <h2 id="gr-demo-h" className="h2 case-h2">
            Two workspaces, one <em className="serif">trail</em>.
          </h2>
          <p className="lede muted demo-intro">
            Try a sample prompt as a developer, then switch to the administrator view to see the decision appear in the audit log and approval queue. Detection here uses a small set of
            deterministic rules running in your browser — a stand-in for the real engine, with obviously synthetic data.
          </p>
          <GuardrailDemo />
        </div>
      </section>

      <CaseSection n="04" label="Engineering evidence" title="Tested like it has to *fail safely*.">
        <Evidence
          items={[
            { value: <CountUp value={820} prefix="~" />, label: "automated tests across backend, dashboard and extension" },
            { value: <CountUp value={9000} suffix="+" />, label: "API fuzzing requests, with zero crashes" },
            { value: "250–345", label: "requests per second on a CI machine" },
            { value: "CI", label: "dependency audits, Chrome/Edge browser tests, Docker image smoke test" },
          ]}
          note="Project-reported engineering results — not independently verified, and not produced by this website"
        />
        <div className="body-text" style={{ marginTop: 40 }}>
          <p>
            Tooling: pytest and Hypothesis for property-based tests on the backend, Vitest for the dashboard, Puppeteer for extension behaviour in real browsers, and GitHub Actions running the
            lot, including a smoke test of the built Docker image.
          </p>
        </div>
      </CaseSection>

      <CaseSection n="05" label="Scope & limitations" title="What it does — and what it *can't*." className="case-section--surface">
        <div className="callout" style={{ marginBottom: 40 }}>
          <span className="label">Honest scope</span>
          <p>
            The system is designed to reduce <strong>accidental</strong> information leaks through supported workflows. It cannot stop a determined insider using an uncontrolled personal
            device, and pattern-based detection will always have false positives and misses. It narrows the risk; it does not remove it.
          </p>
        </div>
        <ScopeTable
          rows={[
            { area: "Detection", documented: "Policy engine for code, credentials, personal, financial and confidential data", demo: "Eight regex rules + a code heuristic, in the browser", production: "Tuned rules per organisation, real traffic" },
            { area: "Enforcement", documented: "Gateway proxy; fail-closed; inspects streamed responses", demo: "Shows the decision and transformed prompt", production: "Actually intercepting requests to AI providers" },
            { area: "Audit", documented: "HMAC-SHA256 chain with periodic Ed25519 signatures", demo: "HMAC chain with a demo key, no signatures", production: "Managed keys and persistent storage" },
            { area: "Admin", documented: "React/TypeScript dashboard, approvals, users, policy", demo: "Local-state approvals, sample users, read-only policy", production: "Authentication, real user directory" },
            { area: "Browser", documented: "Chrome/Edge MV3 extension on supported AI sites", demo: "Not included", production: "Extension installed via managed browser policy" },
          ]}
        />
      </CaseSection>

      <CaseSection n="06" label="What I'd do next" title="Next *iterations*.">
        <NextSteps
          items={[
            "Measure false positives on real (consented) prompts and tune rules per team, not globally.",
            "Explain decisions inside the extension at the moment of paste, so people learn the policy instead of fighting it.",
            "Offer a 'send redacted version' button so a hold doesn't stall someone's work.",
          ]}
        />
        <div className="chips" style={{ marginTop: 48 }}>
          <RepoLink project={p} asButton />
        </div>
      </CaseSection>

      <CaseNav current={p.id} />
    </article>
  );
}
