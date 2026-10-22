import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { PROJECTS, type Project } from "../data/projects";
import { StatusBadge } from "./ModelCard";
import { safeExternalUrl } from "../lib/security";
import { Decode, RegMarks, SectionLabel, Stream } from "./motion";

export function CaseHero({ project: p, title, summary, children }: { project: Project; title: string; summary: string; children?: ReactNode }) {
  return (
    <header className="case-hero paper-grid">
      <div className="wrap">
        <nav aria-label="Breadcrumb" className="crumbs label label--sm">
          <Link to="/work">Work</Link> <span aria-hidden="true">/</span> <span aria-current="page">{p.name}</span>
        </nav>
        <div className="case-hero-top label label--sm">
          <span>
            MODEL CARD · {p.index} · {p.category}
          </span>
          <StatusBadge status={p.status} />
        </div>
        <Decode as="h1" className="h1 case-title" text={title} />
        <Stream as="p" className="lede case-summary" text={summary} msPerWord={30} />
        <dl className="case-meta reg">
          <RegMarks />
          <div>
            <dt className="label label--sm muted">Role</dt>
            <dd>{p.role}</dd>
          </div>
          <div>
            <dt className="label label--sm muted">Stack</dt>
            <dd>{p.stack.join(" · ")}</dd>
          </div>
          <div>
            <dt className="label label--sm muted">Input → Output</dt>
            <dd>
              {p.input} → {p.output}
            </dd>
          </div>
          <div>
            <dt className="label label--sm muted">Code</dt>
            <dd>
              <RepoLink project={p} />
            </dd>
          </div>
        </dl>
        {children}
      </div>
    </header>
  );
}

export function RepoLink({ project: p, asButton = false }: { project: Project; asButton?: boolean }) {
  const repo = safeExternalUrl(p.repo);
  if (repo) {
    return (
      <a className={asButton ? "btn btn--primary" : "text-link"} href={repo} target="_blank" rel="noopener noreferrer">
        <Github aria-hidden="true" strokeWidth={1.5} /> {asButton ? "View repository on GitHub" : repo.replace("https://", "")}
        <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
      </a>
    );
  }
  if (p.repoNote) return <span className="placeholder-tag">{p.repoNote}</span>;
  return <span className="muted">Prototype lives on this site — no separate repository.</span>;
}

export function CaseSection({ n, label, title, children, className = "", id }: { n: string; label: string; title?: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section className={`case-section ${className}`} id={id} aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="wrap">
        <SectionLabel n={n}>{label}</SectionLabel>
        {title && <Decode as="h2" id={id ? `${id}-h` : undefined} className="h2 case-h2" text={title} />}
        {children}
      </div>
    </section>
  );
}

export function TwoCol({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className="two-col">
      <div className="two-col-aside">{aside}</div>
      <div className="two-col-main body-text">{children}</div>
    </div>
  );
}

export function ScopeTable({ rows }: { rows: { area: string; documented: string; demo: string; production: string }[] }) {
  return (
    <div className="table-wrap" role="region" aria-label="Scope comparison" tabIndex={0}>
      <table className="scope-table">
        <thead>
          <tr>
            <th scope="col">Area</th>
            <th scope="col">Documented project capability</th>
            <th scope="col">This portfolio demo</th>
            <th scope="col">Needs a connected deployment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.area}>
              <th scope="row">{r.area}</th>
              <td>{r.documented}</td>
              <td>{r.demo}</td>
              <td>{r.production}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NextSteps({ items }: { items: string[] }) {
  return (
    <ol className="next-list">
      {items.map((t, i) => (
        <li key={t}>
          <span className="label signal">{String(i + 1).padStart(2, "0")}</span>
          <p>{t}</p>
        </li>
      ))}
    </ol>
  );
}

export function CaseNav({ current }: { current: string }) {
  const i = PROJECTS.findIndex((p) => p.id === current);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  return (
    <nav className="case-nav wrap" aria-label="More case studies">
      <Link to={`/work/${prev.slug}`} className="case-nav-link" data-cursor="open">
        <span className="label label--sm muted">
          <ArrowLeft aria-hidden="true" strokeWidth={1.5} /> Previous · {prev.index}
        </span>
        <span className="h3">{prev.name}</span>
      </Link>
      <Link to={`/work/${next.slug}`} className="case-nav-link case-nav-link--next" data-cursor="open">
        <span className="label label--sm muted">
          Next · {next.index} <ArrowRight aria-hidden="true" strokeWidth={1.5} />
        </span>
        <span className="h3">{next.name}</span>
      </Link>
    </nav>
  );
}

export function Evidence({ items, note }: { items: { value: ReactNode; label: string }[]; note?: string }) {
  return (
    <div className="evidence">
      <div className="evidence-grid">
        {items.map((it) => (
          <div key={it.label} className="evidence-item">
            <span className="evidence-value hot">{it.value}</span>
            <span className="evidence-label">{it.label}</span>
          </div>
        ))}
      </div>
      {note && <p className="label label--sm muted evidence-note">{note}</p>}
    </div>
  );
}
