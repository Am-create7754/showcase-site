import { useSearchParams } from "react-router-dom";
import { PROJECTS, TAG_LABEL, type ProjectTag } from "../data/projects";
import { useMeta } from "../lib/hooks";
import { ModelCard } from "../components/ModelCard";
import { Decode, SectionLabel } from "../components/motion";
import { FlowDiagram } from "../components/sections";

const TAGS = Object.keys(TAG_LABEL) as ProjectTag[];

export default function Work() {
  useMeta("Work", "Selected projects by Amber Sahay: IPL Intelligence, Autonomous AppSec Guardrail, MaDDoC, and an exploratory AI design workflow prototype.");
  const [params, setParams] = useSearchParams();
  const raw = params.get("tag");
  const tag = raw && (TAGS as string[]).includes(raw) ? (raw as ProjectTag) : null;
  const list = tag ? PROJECTS.filter((p) => p.tags.includes(tag)) : PROJECTS;

  const setTag = (t: ProjectTag | null) => {
    const next = new URLSearchParams(params);
    if (t) next.set("tag", t);
    else next.delete("tag");
    setParams(next, { replace: true });
  };

  return (
    <>
      <header className="page-hero paper-grid">
        <div className="wrap">
          <SectionLabel n="W">Selected work</SectionLabel>
          <Decode as="h1" className="h1" text="Tools, systems and *prototypes*." />
          <p className="lede muted page-lede">
            Each project starts from a workflow that was harder than it needed to be. Every card states what it does, what it takes in, what it gives back, and how it was checked.
          </p>
          <FlowDiagram
            steps={[
              { label: "Messy process", sub: "manual, slow, unclear" },
              { label: "Mapped workflow", sub: "where time goes" },
              { label: "Focused tool", sub: "AI only where useful", tone: "ai" },
              { label: "Evidence", sub: "tests, known answers", tone: "code" },
              { label: "Clear output", sub: "for the person using it", tone: "human" },
            ]}
            caption="The pattern behind every project on this page"
          />
        </div>
      </header>

      <section className="section section--tight" aria-label="Projects">
        <div className="wrap">
          <div className="filter-bar" role="group" aria-label="Filter projects by area">
            <button type="button" className="chip" aria-pressed={!tag} onClick={() => setTag(null)}>
              All · {PROJECTS.length}
            </button>
            {TAGS.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => setTag(t)}>
                {TAG_LABEL[t]} · {PROJECTS.filter((p) => p.tags.includes(t)).length}
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {list.length} project{list.length === 1 ? "" : "s"}
          </p>
          {list.length === 0 ? (
            <div className="state-panel">
              <p className="muted">No projects match this filter.</p>
              <button type="button" className="btn" onClick={() => setTag(null)}>
                Show all
              </button>
            </div>
          ) : (
            <div className="work-grid">
              {list.map((p, i) => (
                <ModelCard key={p.id} project={p} layout={i === 0 ? "feature" : "tall"} headingLevel="h2" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
