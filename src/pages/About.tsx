import { Link } from "react-router-dom";
import { ArrowUpRight, Github } from "lucide-react";
import { FREELANCE, LEADERSHIP, PRINCIPLES, PROFILE } from "../data/profile";
import { PROJECTS } from "../data/projects";
import { useMeta } from "../lib/hooks";
import { Decode, Reveal, SectionLabel, Stream } from "../components/motion";
import { Portrait } from "../components/Portrait";
import { SkillsGrid } from "../components/sections";
import { StatusBadge } from "../components/ModelCard";

const NARRATIVE = [
  "I'm a Computer Science and Engineering student interested in the space between AI systems and the people who use them.",
  "My projects range from natural-language data investigation to security-aware AI workflows and multi-role web products. Across them, I focus on turning complex processes into clear interfaces, building practical tools, and validating behaviour through testing.",
  "I'm particularly interested in exploring how emerging AI capabilities can fit into real creative workflows without adding unnecessary complexity.",
];

export default function About() {
  useMeta("About", "About Amber Sahay — CSE student at SRM IST building AI-powered tools and clear interfaces. Working approach, skills and leadership.");
  return (
    <>
      <header className="page-hero paper-grid">
        <div className="wrap about-hero">
          <Portrait />
          <div>
            <SectionLabel n="A">About</SectionLabel>
            <Decode as="h1" className="h1" text="Human in the *loop*." />
            <div className="about-narrative">
              <Stream as="p" className="lede" text={NARRATIVE[0]} msPerWord={30} />
              <p className="body-text">{NARRATIVE[1]}</p>
              <p className="body-text">{NARRATIVE[2]}</p>
            </div>
            <div className="chips about-links">
              <a className="btn" href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
                <Github aria-hidden="true" strokeWidth={1.5} /> GitHub <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
              </a>
              <Link className="btn" to="/resume">
                Resume
              </Link>
              <a className="btn btn--primary" href="#contact">
                Contact
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="approach-h">
        <div className="wrap">
          <SectionLabel n="01">Working approach</SectionLabel>
          <div className="sec-head">
            <Decode as="h2" id="approach-h" className="h2" text="How I *work*." />
            <p>Six habits that show up in every project on this site — and that I'd bring to a design team's workflow.</p>
          </div>
          <ol className="principles">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p} delay={i * 60}>
                <span className="label signal">{String(i + 1).padStart(2, "0")}</span>
                <p className="h4">{p}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="skills-h">
        <div className="wrap">
          <SectionLabel n="02">Skills</SectionLabel>
          <Decode as="h2" id="skills-h" className="h2 case-h2" text="The *toolkit*." />
          <SkillsGrid compact />
        </div>
      </section>

      <section className="section" aria-labelledby="lead-h">
        <div className="wrap two-col">
          <div>
            <SectionLabel n="03">Clients, leadership & collaboration</SectionLabel>
            <Decode as="h2" id="lead-h" className="h2" text="Working with *people*." />
          </div>
          <div className="lead-stack">
          <div className="lead-card">
            <p className="label label--sm muted">{FREELANCE.period}</p>
            <h3 className="h3">{FREELANCE.title}</h3>
            <p className="signal">Portfolio websites for 2 clients</p>
            <ul className="bullets-plain">
              {FREELANCE.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <a className="text-link lead-live" href={FREELANCE.live.url} target="_blank" rel="noopener noreferrer">
              Live client site: {FREELANCE.live.label} <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
            </a>
            <p className="muted lead-note">Working directly with a client: turning their requirements into a visual design, then into a shipped site.</p>
          </div>
          <div className="lead-card">
            <p className="label label--sm muted">{LEADERSHIP.period}</p>
            <h3 className="h3">{LEADERSHIP.org}</h3>
            <p className="signal">{LEADERSHIP.title}</p>
            <ul className="bullets-plain">
              {LEADERSHIP.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <p className="muted lead-note">Evidence of communication, coordination and collaboration with partners outside a technical team.</p>
          </div>
          </div>
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="proj-h">
        <div className="wrap">
          <SectionLabel n="04">Projects</SectionLabel>
          <Decode as="h2" id="proj-h" className="h2 case-h2" text="See the *work*." />
          <ul className="project-index">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <Link to={`/work/${p.slug}`} data-cursor="open">
                  <span className="label label--sm muted">{p.index}</span>
                  <span className="h3">{p.name}</span>
                  <span className="muted project-index-cat">{p.category}</span>
                  <StatusBadge status={p.status} />
                  <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
