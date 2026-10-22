import { Download, Printer } from "lucide-react";
import { ACHIEVEMENTS, FREELANCE, LEADERSHIP, PROFILE, QWORLD, SKILL_GROUPS } from "../data/profile";
import { useMeta } from "../lib/hooks";

const RESUME_PROJECTS = [
  {
    name: "IPL Intelligence — AI Cricket Analytics & Investigation Agent",
    stack: "Python, DuckDB, Parquet, OpenAI API, Plotly, Pydantic, Pytest",
    link: "github.com/Am-create7754/Pitch-Prompt",
    points: [
      "Built an AI agent to investigate 1,200+ IPL matches and 295K+ ball-by-ball deliveries through natural-language questions.",
      "Designed a deterministic DuckDB + Parquet analytics pipeline over Cricsheet data with batting, bowling, phase, matchup, season and venue analysis.",
      "Implemented a Match Intelligence Engine that reconstructs delivery-level game state to identify partnerships, collapses and turning points.",
      "Used OpenAI tool calling with deterministic-first routing and a no-API fallback; statistics are always computed by validated code.",
      "Wrote unit, integration, golden-data and regression tests against known IPL records.",
    ],
  },
  {
    name: "Autonomous AppSec Guardrail for Shadow AI Deployments",
    stack: "Python, FastAPI, SQLAlchemy, SQLite, React, TypeScript, Chrome MV3, pytest, Vitest, Hypothesis, Puppeteer, Docker, GitHub Actions",
    link: "github.com/Am-create7754/Shadow-AI-Guardrail",
    points: [
      "Built an OpenAI-compatible FastAPI gateway that inspects prompts and responses (including streams) before they reach external AI tools.",
      "Developed a policy engine that allows, redacts, holds for approval, or blocks requests containing code, credentials, personal, financial or confidential data; fails closed.",
      "Implemented a tamper-evident audit log using HMAC-SHA256 chaining and periodic Ed25519 signatures.",
      "Built a React/TypeScript admin dashboard and a Chrome/Edge extension for supported AI websites.",
      "Project-reported: ~820 automated tests, 9,000+ API fuzzing requests with zero crashes, Docker image smoke-tested in CI.",
    ],
  },
  {
    name: "MaDDoC — AI-Powered Healthcare Marketplace (in progress)",
    stack: "React, Node.js, PostgreSQL, Prisma, Razorpay, Daily, REST APIs",
    link: "github.com/Am-create7754/MaDDoc",
    points: [
      "Developing a multi-role platform for patients, doctors and administrators: discovery, booking, verification, availability and role-based dashboards.",
      "Integrated payments (Razorpay), video consultations (Daily), digital prescriptions and medical records.",
      "Building an AI Health Assistant that uses authorization-aware patient context for guidance and care-plan support.",
    ],
  },
  {
    name: "AI Design Workflow Assistant — exploratory concept prototype",
    stack: "React, TypeScript",
    link: null,
    points: [
      "Prototyped a tool that organises a design brief into requirements, compares concept directions and CMF options, and converts review feedback into prioritised tasks.",
      "Independent exploration; not validated with professional designers.",
    ],
  },
];

export default function Resume() {
  useMeta("Resume", "Resume of Amber Sahay — Computer Science and Engineering student at SRM IST; AI, product and interface projects.");
  return (
    <section className="section resume-page">
      <div className="wrap">
        <div className="resume-actions no-print">
          <button type="button" className="btn btn--primary" onClick={() => window.print()}>
            <Printer aria-hidden="true" strokeWidth={1.5} /> Print / save as PDF
          </button>
          {PROFILE.resumePdf ? (
            <a className="btn" href={PROFILE.resumePdf} download>
              <Download aria-hidden="true" strokeWidth={1.5} /> Download resume (PDF)
            </a>
          ) : (
            <span className="placeholder-tag">Resume PDF — add to /public and set PROFILE.resumePdf</span>
          )}
        </div>

        <article className="resume reg">
          <header className="resume-head">
            <h1 className="h1">{PROFILE.name}</h1>
            <p className="resume-role">{PROFILE.role}</p>
            <p className="resume-contact">
              <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
                github.com/Am-create7754
              </a>
              <span aria-hidden="true"> · </span>
              <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">
                linkedin.com/in/amber-sahay-4371b526b
              </a>
              <span aria-hidden="true"> · </span>
              {PROFILE.email ? <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> : <span className="placeholder-tag">Email — add before submitting</span>}
            </p>
            <p className="resume-summary">{PROFILE.positioning}</p>
          </header>

          <section className="resume-sec" aria-labelledby="r-edu">
            <h2 id="r-edu" className="resume-h">
              Education
            </h2>
            <div className="resume-item">
              <div className="resume-item-head">
                <h3>{PROFILE.education.school}</h3>
                <span>{PROFILE.education.period}</span>
              </div>
              <p>
                {PROFILE.education.program} · {PROFILE.education.campus} · CGPA {PROFILE.education.cgpa}
              </p>
            </div>
          </section>

          <section className="resume-sec" aria-labelledby="r-exp">
            <h2 id="r-exp" className="resume-h">
              Experience
            </h2>
            <div className="resume-item">
              <div className="resume-item-head">
                <h3>{FREELANCE.title}</h3>
                <span>{FREELANCE.live.label}</span>
              </div>
              <ul>
                {FREELANCE.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
            <div className="resume-item">
              <div className="resume-item-head">
                <h3>
                  {QWORLD.title}, {QWORLD.org}
                </h3>
                <span>{QWORLD.period}</span>
              </div>
              <ul>
                {QWORLD.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="resume-sec" aria-labelledby="r-skills">
            <h2 id="r-skills" className="resume-h">
              Skills
            </h2>
            <dl className="resume-skills">
              {SKILL_GROUPS.map((g) => (
                <div key={g.title}>
                  <dt>{g.title}</dt>
                  <dd>{g.items.map((i) => i.name).join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="resume-sec" aria-labelledby="r-proj">
            <h2 id="r-proj" className="resume-h">
              Projects
            </h2>
            {RESUME_PROJECTS.map((p) => (
              <div key={p.name} className="resume-item">
                <div className="resume-item-head">
                  <h3>{p.name}</h3>
                  {p.link && <span>{p.link}</span>}
                </div>
                <p className="resume-stack">{p.stack}</p>
                <ul>
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="resume-sec" aria-labelledby="r-lead">
            <h2 id="r-lead" className="resume-h">
              Leadership
            </h2>
            <div className="resume-item">
              <div className="resume-item-head">
                <h3>
                  {LEADERSHIP.org} — {LEADERSHIP.title}
                </h3>
                <span>{LEADERSHIP.period}</span>
              </div>
              <ul>
                {LEADERSHIP.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="resume-sec" aria-labelledby="r-ach">
            <h2 id="r-ach" className="resume-h">
              Achievements & certifications
            </h2>
            <div className="resume-item">
              <ul>
                {ACHIEVEMENTS.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}
