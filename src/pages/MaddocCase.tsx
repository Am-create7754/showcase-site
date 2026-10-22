import { projectBySlug } from "../data/projects";
import { useMeta } from "../lib/hooks";
import { CaseHero, CaseNav, CaseSection, NextSteps, RepoLink } from "../components/case";
import { Reveal } from "../components/motion";
import { FlowDiagram } from "../components/sections";
import { MaddocShowcase } from "../demos/MaddocShowcase";
import { Info } from "lucide-react";

const p = projectBySlug("maddoc")!;

const ROLES = [
  {
    role: "Patient",
    goal: "Find the right doctor quickly, understand the options, book without surprises, and keep track of care afterwards.",
    needs: ["Verified doctors only", "Fee and next slot visible up front", "Comparison without opening ten tabs", "One place for prescriptions and records"],
  },
  {
    role: "Doctor",
    goal: "Control availability, see only relevant patient context before a consultation, and keep the day organised.",
    needs: ["Simple weekly availability", "Today's schedule at a glance", "Patient-shared context, nothing more", "Digital prescriptions"],
  },
  {
    role: "Administrator",
    goal: "Keep the marketplace trustworthy by verifying doctors and overseeing operations.",
    needs: ["Verification queue", "Clear approve / request-info actions", "Marketplace overview"],
  },
];

const DEVELOPED = [
  "Doctor discovery",
  "Appointment booking",
  "Doctor onboarding & verification",
  "Availability management",
  "Role-based dashboards",
  "Payments (Razorpay)",
  "Video consultations (Daily)",
  "Digital prescriptions",
  "Medical records",
  "Doctor–patient communication",
  "AI Health Assistant with authorization-aware context",
];

const NOT_YET = [
  "Production deployment and hardening",
  "Independent accessibility audit",
  "Clinical review of the AI assistant's guidance",
  "Usability testing with real patients and doctors",
];

export default function MaddocCase() {
  useMeta("MaDDoC", "Case study: MaDDoC, a multi-role healthcare marketplace (in progress) — product thinking and UX for patients, doctors and administrators.");
  return (
    <article>
      <CaseHero
        project={p}
        title="One product, three very *different* users."
        summary="MaDDoC is a full-stack healthcare marketplace connecting patients with verified doctors. It is still in progress. This case study focuses on the product question underneath it: how do you keep a multi-role product understandable for everyone using it?"
      >
        <div className="note">
          <Info aria-hidden="true" strokeWidth={1.5} />
          <p>
            <strong>In progress.</strong> The showcase below uses synthetic people and simulated flows to explain the product design. It is not a screenshot of the live app, and nothing
            here implies clinical validation.
          </p>
        </div>
      </CaseHero>

      <CaseSection n="01" label="Users & goals" title="Start from what each person is *trying* to do.">
        <div className="roles-grid">
          {ROLES.map((r, i) => (
            <Reveal key={r.role} className="role-card" delay={i * 80}>
              <p className="label signal">0{i + 1} · {r.role}</p>
              <p className="role-goal">{r.goal}</p>
              <ul>
                {r.needs.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </CaseSection>

      <CaseSection n="02" label="Patient journey" title="Fewer decisions per *screen*." className="case-section--surface">
        <FlowDiagram
          steps={[
            { label: "Discover", sub: "search, filter, verified only" },
            { label: "Compare", sub: "fee, slot, mode side by side" },
            { label: "Book", sub: "slot → details → pay", tone: "code" },
            { label: "Consult", sub: "video or in-clinic" },
            { label: "Manage care", sub: "prescriptions, records, assistant", tone: "human" },
          ]}
          caption="Each step asks one question; the booking flow shows progress so nobody wonders how much is left"
        />
      </CaseSection>

      <section className="case-section" aria-labelledby="md-demo-h">
        <div className="wrap">
          <p className="sec-label label">
            <b>§ 03</b> — Product showcase
          </p>
          <h2 id="md-demo-h" className="h2 case-h2">
            Switch <em className="serif">roles</em>, keep your bearings.
          </h2>
          <p className="lede muted demo-intro">
            Try booking as a patient, toggling availability as a doctor, and verifying a doctor as an administrator. The structure stays the same across roles; only the content changes.
          </p>
          <MaddocShowcase />
        </div>
      </section>

      <CaseSection n="04" label="Design decisions" title="Clarity is a *safety* feature here." className="case-section--surface">
        <div className="two-col">
          <div className="two-col-aside">
            <p>In healthcare, confusion isn't just friction — it can mean a missed appointment or a misunderstood instruction.</p>
          </div>
          <div className="two-col-main body-text">
            <ul className="bullets">
              <li>Verification is visible: unverified doctors simply don't appear to patients.</li>
              <li>Cost and next availability are on the card, not hidden behind a click.</li>
              <li>Booking is a four-step stepper with a visible position and a back button at every step.</li>
              <li>The AI assistant shows which context it may use, and only uses what the patient has authorised.</li>
              <li>The assistant prepares patients for consultations rather than diagnosing — and says so.</li>
            </ul>
          </div>
        </div>
      </CaseSection>

      <CaseSection n="05" label="Status" title="Developed vs. *not yet*.">
        <div className="status-cols">
          <div>
            <p className="label label--sm muted">Developed — under active iteration</p>
            <ul className="status-list">
              {DEVELOPED.map((d) => (
                <li key={d}>
                  <span className="dot" style={{ color: "var(--signal)" }} aria-hidden="true" /> {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label label--sm muted">Not done yet</p>
            <ul className="status-list status-list--todo">
              {NOT_YET.map((d) => (
                <li key={d}>
                  <span className="dot" aria-hidden="true" /> {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="chips" style={{ marginTop: 56 }}>
          <RepoLink project={p} asButton />
        </div>
      </CaseSection>

      <CaseSection n="06" label="What I'd do next" title="Next *iterations*." className="case-section--surface">
        <NextSteps
          items={[
            "Run task-based usability tests for the booking flow with five people per role.",
            "Audit colour contrast, screen-reader labels and keyboard paths across all three dashboards.",
            "Write down what the assistant must never do, and test it against those rules before any wider release.",
          ]}
        />
      </CaseSection>

      <CaseNav current={p.id} />
    </article>
  );
}
