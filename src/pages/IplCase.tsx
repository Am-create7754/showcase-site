import { projectBySlug } from "../data/projects";
import { useMeta } from "../lib/hooks";
import { CaseHero, CaseNav, CaseSection, Evidence, NextSteps, RepoLink } from "../components/case";
import { CountUp, Reveal } from "../components/motion";
import { FlowDiagram } from "../components/sections";
import { IplDashboard } from "../demos/IplDashboard";

const p = projectBySlug("ipl-intelligence")!;

export default function IplCase() {
  useMeta(
    "IPL Intelligence",
    "Case study: an AI agent that answers natural-language questions over 1,200+ IPL matches using deterministic DuckDB analytics, with an interactive demonstration.",
  );
  return (
    <article>
      <CaseHero
        project={p}
        title="Asking a dataset *questions*, not writing queries."
        summary="IPL Intelligence lets someone investigate more than 1,200 IPL matches and 295K+ ball-by-ball deliveries in plain language. Python and SQL calculate every number; the language model only helps route the question and explain the result."
      />

      <CaseSection n="01" label="The story" title="From a dense dataset to an *answer* someone can trust.">
        <div className="story">
          <Reveal className="story-step">
            <p className="label signal">01 · Problem</p>
            <div className="body-text">
              <h3 className="h3">Investigating match data takes queries and domain knowledge.</h3>
              <p>
                Ball-by-ball cricket data is rich but awkward. To answer "how did this team bat in the death overs?" you need to know the schema, write the query, handle extras and
                dismissals correctly, and then turn the numbers into something readable. Most people who have the question don't have that workflow.
              </p>
            </div>
          </Reveal>
          <Reveal className="story-step">
            <p className="label signal">02 · Approach</p>
            <div className="body-text">
              <h3 className="h3">A natural-language front door to deterministic tools.</h3>
              <p>
                The core rule is simple: <strong>code calculates, AI interprets.</strong> A language model never "remembers" a statistic. Questions are routed to validated analytics
                functions; only their structured output is handed to the model to explain. If the data can't prove something, the system says so.
              </p>
            </div>
          </Reveal>
          <Reveal className="story-step">
            <p className="label signal">03 · System</p>
            <div className="body-text">
              <h3 className="h3">Routing first, model second.</h3>
              <p>
                A deterministic parser handles most questions directly and turns them into a structured query. Only when it genuinely can't, a bounded OpenAI tool-calling loop picks
                from the same validated tools — and there is a no-API fallback so the analytics work without any key at all.
              </p>
              <ul className="bullets">
                <li>DuckDB + Parquet pipeline over Cricsheet ball-by-ball data</li>
                <li>Batting and bowling metrics, phase analysis, matchups, leaderboards, season and venue views</li>
                <li>A Match Intelligence Engine that reconstructs delivery-level game state to find partnerships, collapses and turning points</li>
                <li>Pydantic-typed results and interactive Plotly charts</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </CaseSection>

      <CaseSection n="02" label="Architecture" title="Where the model is — and *isn't* — allowed to act." className="case-section--surface">
        <FlowDiagram
          steps={[
            { label: "User question", sub: "plain English" },
            { label: "Intent / tool routing", sub: "deterministic-first; LLM only as fallback", tone: "ai" },
            { label: "Validated analytics", sub: "DuckDB + Python", tone: "code" },
            { label: "Structured results", sub: "typed with Pydantic", tone: "code" },
            { label: "Interpretation", sub: "LLM explains computed numbers", tone: "ai" },
            { label: "Visualization", sub: "Plotly chart + answer", tone: "human" },
          ]}
          caption="Blue outline = model may participate · grey fill = deterministic code · dashed = what the person sees"
        />
      </CaseSection>

      <section className="case-section case-section--dark" aria-labelledby="ipl-demo-h">
        <div className="wrap">
          <p className="sec-label label">
            <b>§ 03</b> — The experience
          </p>
          <h2 id="ipl-demo-h" className="h2 case-h2">
            Try the <em className="serif">investigation</em> loop.
          </h2>
          <p className="lede muted demo-intro">
            A portfolio demonstration built for this page — not a screenshot of the repository. The data is a single fictional match; the routing, metrics and turning-point rules run
            live in your browser so you can see how a question becomes a verified answer and a chart.
          </p>
          <IplDashboard />
        </div>
      </section>

      <CaseSection n="04" label="Validation" title="Checked against *known* answers.">
        <div className="two-col">
          <div className="two-col-aside">
            <p>A statistics tool that is "mostly right" is worse than no tool — people stop trusting every number. So behaviour is pinned down by tests.</p>
          </div>
          <div className="two-col-main body-text">
            <ul className="bullets">
              <li>
                <strong>Golden-data tests</strong> compare outputs with known IPL records, so the pipeline is checked against facts rather than against itself.
              </li>
              <li>
                <strong>Regression tests</strong> protect metrics that are easy to break — extras, dismissals, phase boundaries — as the code changes.
              </li>
              <li>
                <strong>Unit and integration tests</strong> cover each analytics function and the route from question to answer.
              </li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 48 }}>
          <Evidence
            items={[
              { value: <CountUp value={1200} suffix="+" />, label: "IPL matches in the dataset" },
              { value: <CountUp value={295} suffix="K+" />, label: "ball-by-ball deliveries" },
              { value: "0", label: "statistics generated by the language model" },
            ]}
            note="Dataset scale from Cricsheet IPL data as processed by the project"
          />
        </div>
      </CaseSection>

      <CaseSection n="05" label="Why it matters for design" title="Dense numbers, *readable* decisions." className="case-section--surface">
        <div className="callout">
          <span className="label">Design relevance</span>
          <div className="body-text">
            <p>
              This isn't an industrial-design tool. What carries over is the interface problem: taking a large, technical body of information and shaping it so a person can investigate it,
              trust it and act on it. The same pattern — grounded data, a plain-language entry point, a visual answer — applies to design-team questions like "which review comments are
              still open?" or "which material options met the durability brief?"
            </p>
          </div>
        </div>
      </CaseSection>

      <CaseSection n="06" label="What I'd do next" title="Next *iterations*.">
        <NextSteps
          items={[
            "Usability-test the question box with people who follow cricket but don't write SQL, and log which questions fail routing.",
            "Show the routing trace in the product UI, so users can see which tool produced each number.",
            "Add saved investigations — a question, its chart and its explanation as a shareable card.",
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
