// Single source of truth for personal content. Edit here — every page reads from this file.

export const PROFILE = {
  name: "Amber Sahay",
  role: "AI Generalist — Design",
  education: {
    school: "SRM Institute of Science and Technology",
    campus: "Kattankulathur, Chennai",
    program: "B.Tech, Computer Science and Engineering",
    period: "2023 — 2027 · expected graduation May 2027",
    cgpa: "8.89",
  },
  positioning:
    "I build AI-powered tools and intuitive workflows that turn complex processes into clear, usable experiences.",
  supporting:
    "My work sits at the intersection of AI engineering, workflow automation, data visualization, and product experience. I enjoy understanding a problem, breaking it into practical steps, and building tools that make the process simpler.",
  currently: "Exploring how AI tools can fit into design workflows",
  status: "Open to learning, building & collaborating",
  links: {
    github: "https://github.com/Am-create7754",
    linkedin: "https://www.linkedin.com/in/amber-sahay-4371b526b",
  },
  /**
   * REPLACE BEFORE SUBMITTING. While null, the site shows a clearly marked placeholder
   * instead of inventing an address. Example: "name@example.com".
   */
  /** Portrait used on About + home. To change it, replace public/amber-sahay.webp and update width/height. */
  photo: { src: "/amber-sahay.webp", width: 577, height: 890, alt: "Portrait of Amber Sahay, smiling, outdoors under a cloudy sky" } as { src: string; width: number; height: number; alt: string } | null,
  email: "ambersahay18@gmail.com" as string | null,
  /**
   * Path to a real resume PDF placed in /public (e.g. "/Amber-Sahay-Resume.pdf").
   * While null, the Resume page shows a print-friendly view and a labelled placeholder.
   */
  resumePdf: "/Amber-Sahay-Resume.pdf" as string | null,
};

export interface QA {
  q: string;
  a: string;
  chip: string;
}

/** Pre-written console answers — no live model is called. */
export const HERO_QA: QA[] = [
  {
    chip: "what I do",
    q: "what do you do?",
    a: "I build AI-powered tools and clear interfaces that turn complex workflows into something people can actually use.",
  },
  {
    chip: "how I use AI",
    q: "how do you use AI?",
    a: "Where it adds genuine value. Validated logic computes the numbers and makes the critical calls; models help interpret, route and explain.",
  },
  {
    chip: "projects",
    q: "what have you built?",
    a: "An IPL analytics agent, a guardrail for AI traffic, a healthcare marketplace (in progress) and a design-workflow prototype. Scroll ↓",
  },
  {
    chip: "why design",
    q: "why a design team?",
    a: "A good tool isn't only functional — the people using it have to understand it. I'd like to build tools for the people who design.",
  },
  {
    chip: "availability",
    q: "are you available?",
    a: "Yes — for an AI Generalist (Design) internship. Contact details are at the bottom of every page.",
  },
];

export const TOOLBELT = [
  "Python", "DuckDB", "Parquet", "OpenAI API", "Tool calling", "FastAPI", "Pydantic", "Pytest",
  "React", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Plotly", "Docker", "GitHub Actions",
];

export interface SkillGroup {
  title: string;
  note: string;
  /** used: true = used in a project shown on this site; false = working familiarity */
  items: { name: string; used: boolean }[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "AI & Intelligence",
    note: "Grounded agents, tool use and evaluation",
    items: [
      { name: "LLMs", used: true },
      { name: "AI agents", used: true },
      { name: "Tool calling", used: true },
      { name: "Prompt engineering", used: true },
      { name: "LLM evaluation", used: true },
      { name: "MCP", used: false },
      { name: "RAG", used: false },
      { name: "Embeddings", used: false },
      { name: "Vector databases", used: false },
      { name: "LoRA", used: false },
    ],
  },
  {
    title: "Product & Interface Building",
    note: "From API to usable screen",
    items: [
      { name: "React", used: true },
      { name: "TypeScript", used: true },
      { name: "JavaScript", used: true },
      { name: "HTML / CSS", used: true },
      { name: "Node.js", used: true },
      { name: "FastAPI", used: true },
      { name: "REST APIs", used: true },
      { name: "Flask", used: false },
    ],
  },
  {
    title: "Data & Visualization",
    note: "Dense numbers into readable answers",
    items: [
      { name: "Python", used: true },
      { name: "DuckDB", used: true },
      { name: "Parquet", used: true },
      { name: "SQL", used: true },
      { name: "Plotly", used: true },
      { name: "PostgreSQL", used: true },
      { name: "Pandas", used: false },
      { name: "MongoDB", used: false },
    ],
  },
  {
    title: "Engineering & Delivery",
    note: "Tested, documented, shippable",
    items: [
      { name: "Git / GitHub", used: true },
      { name: "Testing (pytest, Vitest)", used: true },
      { name: "Docker", used: true },
      { name: "GitHub Actions", used: true },
      { name: "Documentation", used: true },
      { name: "Postman", used: false },
      { name: "AWS", used: false },
      { name: "Agile", used: false },
    ],
  },
];

export const PRINCIPLES = [
  "Start with the user and the actual problem.",
  "Understand the existing process before automating it.",
  "Use AI where it adds genuine value.",
  "Keep critical calculations and decisions grounded in validated logic.",
  "Make outputs understandable.",
  "Test, document, and refine.",
];

export const PROCESS = [
  {
    n: "01",
    title: "Understand the problem",
    line: "Talk to the people doing the work and find where time actually goes.",
    artefact: "Problem statement + who it hurts",
  },
  {
    n: "02",
    title: "Map the existing workflow",
    line: "Draw the current steps before changing any of them.",
    artefact: "Workflow map with bottlenecks marked",
  },
  {
    n: "03",
    title: "Build a focused solution",
    line: "The smallest tool that removes the bottleneck — AI only where it helps.",
    artefact: "Working prototype or script",
  },
  {
    n: "04",
    title: "Test against evidence",
    line: "Known answers, regression tests and edge cases — not vibes.",
    artefact: "Golden-data and regression tests",
  },
  {
    n: "05",
    title: "Refine and communicate",
    line: "Document how it works, where it stops, and what to try next.",
    artefact: "README, tutorial, limitations",
  },
];

export const FREELANCE = {
  title: "Freelance Web Designer & Developer",
  period: "Client work",
  points: [
    "Designed and developed portfolio websites for 2 freelance clients, owning the work from requirements and visual design through to implementation.",
    "Delivered and deployed the first client's portfolio live; the second client's website is in progress.",
  ],
  live: { label: "aryan-sahay.netlify.app", url: "https://aryan-sahay.netlify.app" },
};

export const QWORLD = {
  org: "QWorld",
  title: "Project Intern",
  period: "Aug 2025 — Sep 2025",
  points: [
    "Selected for the QWorld global internship programme to build a Quantum Machine Learning based cybersecurity project, competing against 20 teams.",
    "Developed data pipelines and optimised technical workflows for a ransomware threat-detection system.",
    "Executed core technical tasks and model training; the team placed 3rd of 20 global teams within a two-month delivery window.",
  ],
};

export const ACHIEVEMENTS = [
  "SAP Certified Backend Developer — ABAP Cloud (RESTful Application Programming Model)",
  "3rd place among 20 global teams — Quantum Machine Learning cybersecurity project, QWorld Global Event",
];

export const LEADERSHIP = {
  org: "AIESEC Chennai",
  title: "Incoming Global Volunteer — Global Buddy",
  period: "Aug 2024 — Feb 2025",
  points: [
    "Worked with WHO-linked NGOs as part of the incoming global volunteer programme.",
    "Recruited three NGOs as partners.",
    "Progressed to a team-lead role after approximately two months.",
  ],
};
