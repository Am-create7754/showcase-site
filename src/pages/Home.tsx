import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { PROFILE } from "../data/profile";
import { PROJECTS } from "../data/projects";
import { useMeta } from "../lib/hooks";
import { NeuralField } from "../components/ambient";
import { PromptConsole } from "../components/PromptConsole";
import { Portrait } from "../components/Portrait";
import { ModelCard } from "../components/ModelCard";
import { Capabilities, Marquee, ProcessTrack, SkillsGrid } from "../components/sections";
import { Decode, Magnetic, Reveal, SectionLabel, Stream } from "../components/motion";

export default function Home() {
  useMeta("", "Amber Sahay — AI Generalist (Design). AI-powered tools, intelligent workflows and clear interfaces, with interactive case studies.");
  const [ipl, guard, maddoc, design] = PROJECTS;

  return (
    <>
      {/* 01 — Hero */}
      <section className="hero paper-grid" aria-labelledby="hero-title">
        <NeuralField />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="label hero-eyebrow">
              <span className="signal">{PROFILE.name}</span> — AI Generalist / Creative Technology / Product Thinking
            </p>
            <Decode as="h1" id="hero-title" className="display hero-title" text="Making complex workflows feel *effortless*." />
            <p className="lede hero-lede">I build AI-powered tools, intelligent workflows, and clear interfaces that help people turn complex information into useful outcomes.</p>
            <p className="hero-sub muted">From data-driven investigation to AI guardrails, I explore how technology can make everyday work simpler, safer, and more intuitive.</p>
            <div className="hero-ctas">
              <Magnetic>
                <a href="#work" className="btn btn--primary">
                  Explore selected work <ArrowDown aria-hidden="true" strokeWidth={1.5} />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#approach" className="btn">
                  View my approach
                </a>
              </Magnetic>
            </div>
          </div>
          <div className="hero-console">
            <div className="console-glow" aria-hidden="true" />
            <PromptConsole />
          </div>
        </div>
        <div className="wrap hero-foot">
          <span className="label label--sm muted scroll-cue">
            Scroll <ArrowDown aria-hidden="true" strokeWidth={1.5} />
          </span>
          <span className="pill">
            <span className="dot dot--live" aria-hidden="true" /> Currently: {PROFILE.currently.toLowerCase()}
          </span>
          <span className="label label--sm muted hero-status">{PROFILE.status}</span>
        </div>
      </section>

      {/* 02 — Toolbelt */}
      <Marquee />

      {/* 03 — Capabilities */}
      <section className="section" aria-labelledby="cap-title">
        <div className="wrap">
          <SectionLabel n="01">Capabilities</SectionLabel>
          <div className="sec-head">
            <Decode as="h2" id="cap-title" className="h2" text="One brain, many *models*." />
            <p>Not a list of buzzwords — six things I can actually do, each linked to the project that proves it. Hover or focus a cell for the stack and the evidence.</p>
          </div>
          <Capabilities />
        </div>
      </section>

      {/* 04 — Selected work */}
      <section className="section section--work paper-grid" id="work" aria-labelledby="work-title">
        <div className="wrap">
          <SectionLabel n="02">Selected work</SectionLabel>
          <div className="sec-head">
            <Decode as="h2" id="work-title" className="h2" text="Things I've *built*." />
            <p>Four projects, each shown as a model card: what it does, what goes in, what comes out, and the evidence behind it. Each opens into a case study with an interactive demo.</p>
          </div>
          <div className="work-layout">
            <ModelCard project={ipl} layout="feature" />
            <div className="work-pair">
              <ModelCard project={guard} layout="dark" />
              <ModelCard project={maddoc} layout="tall" />
            </div>
            <ModelCard project={design} layout="wide" />
          </div>
          <div className="work-more">
            <Link to="/work" className="text-link label">
              All work, with filters <ArrowRight aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* 05 — Process */}
      <section className="section" id="approach" aria-labelledby="approach-title">
        <div className="wrap">
          <SectionLabel n="03">Approach</SectionLabel>
          <div className="sec-head">
            <Decode as="h2" id="approach-title" className="h2" text="How I *think*." />
            <p>
              I value useful solutions, measurable evidence and clarity over adding AI for its own sake. If a lookup table solves it, it gets a lookup table.
            </p>
          </div>
          <ProcessTrack />
        </div>
      </section>

      {/* 06 — Skills */}
      <section className="section section--surface" aria-labelledby="skills-title">
        <div className="wrap">
          <SectionLabel n="04">Skills snapshot</SectionLabel>
          <div className="sec-head">
            <Decode as="h2" id="skills-title" className="h2" text="What I work *with*." />
            <p>Grouped by what they're for. A filled mark means it's used in a project on this site; hollow means working familiarity.</p>
          </div>
          <SkillsGrid />
        </div>
      </section>

      {/* 07 — Human in the loop */}
      <section className="section" aria-labelledby="human-title">
        <div className="wrap human">
          <Portrait />
          <div>
            <SectionLabel n="05">About</SectionLabel>
            <Decode as="h2" id="human-title" className="h2" text="Human in the *loop*." />
            <Stream
              className="lede human-text"
              text="I'm a Computer Science and Engineering student interested in the space between AI systems and the people who use them. I focus on turning complex processes into clear interfaces, building practical tools, and validating behaviour through testing."
            />
            <dl className="currently">
              <div>
                <dt className="label label--sm muted">Exploring</dt>
                <dd>How AI tools fit into creative and industrial-design workflows</dd>
              </div>
              <div>
                <dt className="label label--sm muted">Building</dt>
                <dd>Small, testable tools — the design workflow prototype on this site</dd>
              </div>
              <div>
                <dt className="label label--sm muted">Learning</dt>
                <dd>How design teams move from brief to concept to review</dd>
              </div>
            </dl>
            <Reveal className="chips human-ctas">
              <Link to="/about" className="btn">
                More about me <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
              </Link>
              <Link to="/resume" className="btn">
                Resume
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
