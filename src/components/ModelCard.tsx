import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { STATUS_LABEL, type Project } from "../data/projects";
import { useInView } from "../lib/hooks";
import { CountUp, RegMarks } from "./motion";
import { ProjectVisual } from "./visuals";

export function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span className={`badge badge--${status}`}>
      <span className="dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export type CardLayout = "feature" | "tall" | "wide" | "dark";

/** A project presented as a "model card": task, input → output, stack, evidence. */
export function ModelCard({ project: p, layout = "tall", headingLevel = "h3" }: { project: Project; layout?: CardLayout; headingLevel?: "h2" | "h3" }) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 });
  const H = headingLevel;
  const to = `/work/${p.slug}`;
  return (
    <article ref={ref} className={`model-card model-card--${layout} reg ${inView ? "is-in" : ""}`} data-cursor="open">
      <RegMarks />
      <div className="mc-top label label--sm">
        <span>MODEL CARD · {p.index}</span>
        <StatusBadge status={p.status} />
      </div>
      <div className="mc-body">
        <div className="mc-media" aria-hidden="true">
          <div className="mc-scan">
            <ProjectVisual id={p.id} />
          </div>
        </div>
        <div className="mc-info">
          <p className="label label--sm mc-cat">{p.category}</p>
          <H className="h3 mc-title">
            <Link to={to} className="mc-link">
              {p.name}
            </Link>
          </H>
          <p className="mc-short">{p.short}</p>
          <dl className="mc-spec">
            <div>
              <dt>TASK</dt>
              <dd>{p.task}</dd>
            </div>
            <div className="mc-io">
              <dt>INPUT →</dt>
              <dd>{p.input}</dd>
              <dt>OUTPUT →</dt>
              <dd>{p.output}</dd>
            </div>
            <div>
              <dt>ROLE</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>STACK</dt>
              <dd>{p.stack.join(" · ")}</dd>
            </div>
            <div>
              <dt>{p.metrics.length ? "EVIDENCE" : "STATUS"}</dt>
              <dd className="mc-metrics">
                {p.metrics.length ? (
                  <>
                    {p.metrics.map((m) => (
                      <span key={m.label} className="mc-metric">
                        <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} className="hot" />
                        <small>{m.label}</small>
                      </span>
                    ))}
                    {p.metricNote && <small className="mc-note">{p.metricNote}</small>}
                  </>
                ) : (
                  <small>Exploratory — no performance claims, by design.</small>
                )}
              </dd>
            </div>
          </dl>
          <span className="mc-open label label--sm" aria-hidden="true">
            Open case <ArrowUpRight strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </article>
  );
}
