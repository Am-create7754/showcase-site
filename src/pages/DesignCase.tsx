import { Info } from "lucide-react";
import { projectBySlug } from "../data/projects";
import { useMeta } from "../lib/hooks";
import { CaseHero, CaseNav, CaseSection, NextSteps } from "../components/case";
import { Reveal } from "../components/motion";
import { FlowDiagram } from "../components/sections";
import { DesignAssistant } from "../demos/DesignAssistant";

const p = projectBySlug("design-workflow-assistant")!;

const FRICTION = [
  { k: "Briefs", v: "Goals, constraints and open questions live in long documents and get re-read every review." },
  { k: "Concepts", v: "Directions are compared from memory — rationale and trade-offs aren't written next to the sketch." },
  { k: "CMF", v: "Colour and finish options are scattered across reference images and swatch photos." },
  { k: "Reviews", v: "Comments are captured as notes, then someone turns them into tasks by hand afterwards." },
];

export default function DesignCase() {
  useMeta(
    "AI Design Workflow Assistant",
    "Exploratory concept prototype: how lightweight AI-style utilities could organise a design brief, concept directions, CMF options and review feedback.",
  );
  return (
    <article className="design-page">
      <CaseHero
        project={p}
        title="Designing for the *designers*."
        summary="An exploratory prototype asking one question: could a single lightweight tool take the coordination and documentation work around an industrial-design review — briefs, concepts, materials, feedback — and keep it organised, so designers spend more time designing?"
      >
        <div className="note">
          <Info aria-hidden="true" strokeWidth={1.5} />
          <p>
            <strong>Transparency.</strong> This is an independent exploratory prototype created to investigate how AI-assisted tools might support design workflows. It is not an Ather Energy
            project and has not been validated by professional industrial designers.
          </p>
        </div>
      </CaseHero>

      <CaseSection n="01" label="Where the friction is" title="The work *around* the design work.">
        <div className="friction">
          {FRICTION.map((f, i) => (
            <Reveal key={f.k} className="friction-item" delay={i * 70}>
              <span className="label signal">0{i + 1}</span>
              <h3 className="h4">{f.k}</h3>
              <p className="muted">{f.v}</p>
            </Reveal>
          ))}
        </div>
        <p className="body-text muted" style={{ marginTop: 40 }}>
          These are assumptions drawn from how design work is commonly described, not findings from interviews. The first real step would be to sit with a design team and check them.
        </p>
      </CaseSection>

      <CaseSection n="02" label="Workflow" title="Where a tool helps — and where the designer *decides*." className="case-section--surface">
        <FlowDiagram
          steps={[
            { label: "Brief", sub: "designer writes" , tone: "human" },
            { label: "Requirements", sub: "tool organises", tone: "ai" },
            { label: "Concepts", sub: "designer explores", tone: "human" },
            { label: "CMF board", sub: "tool collects options", tone: "ai" },
            { label: "Review", sub: "team critiques", tone: "human" },
            { label: "Action list", sub: "tool structures feedback", tone: "ai" },
          ]}
          caption="Blue = steps a tool (eventually an LLM) could assist · dashed = human judgement stays with the designer"
        />
      </CaseSection>

      <section className="case-section design-workspace paper-grid" aria-labelledby="da-h">
        <div className="wrap">
          <p className="sec-label label">
            <b>§ 03</b> — Interactive prototype
          </p>
          <div className="sec-head">
            <h2 id="da-h" className="h2">
              One brief, <em className="serif">six</em> panels.
            </h2>
            <p>
              Everything runs locally with deterministic rules — no language model is connected. Each rule-based step marks where an LLM could later slot in, with the same inputs and
              outputs.
            </p>
          </div>
          <DesignAssistant />
        </div>
      </section>

      <CaseSection n="04" label="Design decisions" title="A creative tool, not a *form*.">
        <div className="two-col">
          <div className="two-col-aside">
            <p>The interface borrows from concept boards and lab notebooks rather than admin panels.</p>
          </div>
          <div className="two-col-main body-text">
            <ul className="bullets">
              <li>Large visual tiles for concepts, with rationale and trade-offs written next to each sketch.</li>
              <li>Swatches shown as materials, not hex codes — finish matters as much as colour.</li>
              <li>The summary is always visible and is computed from what's on the page, so it never claims more than it knows.</li>
              <li>Organising steps are deterministic and readable, so a designer can predict and trust the output.</li>
              <li>"Copy summary" exports Markdown — documentation should leave the tool easily.</li>
            </ul>
          </div>
        </div>
      </CaseSection>

      <CaseSection n="05" label="Not claimed" title="What this prototype is *not*." className="case-section--surface">
        <div className="not-claimed">
          {["Not CAD and not 3D modelling", "Not a replacement for industrial designers", "Not connected to a language model", "Not validated with a design team", "Not an Ather Energy project", "Sketches are not design renders"].map((t) => (
            <p key={t} className="not-item">
              <span aria-hidden="true">×</span> {t}
            </p>
          ))}
        </div>
      </CaseSection>

      <CaseSection n="06" label="If I took this further" title="Next *iterations*.">
        <NextSteps
          items={[
            "Shadow a design review and map the real workflow before changing anything.",
            "Swap one rule-based step for an LLM with a fixed output schema, and compare the results side by side with the rules.",
            "Connect to where files already live (shared drives, PLM) instead of creating another silo.",
            "Write a short tutorial so the tool can be adopted without a walkthrough.",
          ]}
        />
      </CaseSection>

      <CaseNav current={p.id} />
    </article>
  );
}
