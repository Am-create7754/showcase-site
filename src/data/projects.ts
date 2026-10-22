export type ProjectStatus = "built" | "progress" | "concept";
export type ProjectTag = "agents" | "data" | "security" | "product" | "design";

export interface Metric {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface Project {
  id: string;
  slug: string;
  index: string;
  name: string;
  accent: string; // the one word rendered in serif italic
  short: string;
  category: string;
  status: ProjectStatus;
  tags: ProjectTag[];
  task: string;
  input: string;
  output: string;
  role: string;
  stack: string[];
  metrics: Metric[];
  metricNote?: string;
  repo: string | null;
  repoNote?: string;
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  built: "BUILT",
  progress: "IN PROGRESS",
  concept: "CONCEPT PROTOTYPE",
};

export const TAG_LABEL: Record<ProjectTag, string> = {
  agents: "Agents",
  data: "Data",
  security: "Security",
  product: "Product",
  design: "Design workflow",
};

export const PROJECTS: Project[] = [
  {
    id: "ipl",
    slug: "ipl-intelligence",
    index: "CS/01",
    name: "IPL Intelligence",
    accent: "Intelligence",
    short:
      "Ask questions about 1,200+ IPL matches in plain language and get answers computed by validated analytics — not remembered by a model.",
    category: "AI Analytics & Investigation",
    status: "built",
    tags: ["agents", "data"],
    task: "Investigate a large match dataset without writing queries",
    input: "Natural-language question",
    output: "Verified numbers + chart + explanation",
    role: "Builder — data pipeline, analytics tools, agent routing, visualisation, tests",
    stack: ["Python", "DuckDB", "Parquet", "OpenAI API", "Plotly", "Pydantic", "Pytest"],
    metrics: [
      { value: 1200, suffix: "+", label: "matches indexed" },
      { value: 295, suffix: "K+", label: "deliveries" },
    ],
    metricNote: "Dataset size from Cricsheet ball-by-ball data",
    repo: "https://github.com/Am-create7754/Pitch-Prompt",
  },
  {
    id: "guardrail",
    slug: "shadow-ai-guardrail",
    index: "CS/02",
    name: "Autonomous AppSec Guardrail",
    accent: "Guardrail",
    short:
      "Inspects prompts and uploads before they reach external AI tools, then allows, redacts, holds or blocks them — with a tamper-evident audit trail.",
    category: "AI Workflow Security",
    status: "built",
    tags: ["agents", "security", "product"],
    task: "Stop accidental leaks of code, secrets and personal data into AI tools",
    input: "Prompts, uploads, model responses",
    output: "Policy decision + redaction + signed audit event",
    role: "Builder — gateway, policy engine, audit chain, dashboard, browser extension",
    stack: ["Python", "FastAPI", "SQLAlchemy", "React", "TypeScript", "Chrome MV3", "Docker"],
    metrics: [
      { value: 820, prefix: "~", label: "automated tests" },
      { value: 9000, suffix: "+", label: "fuzzing requests, 0 crashes" },
    ],
    metricNote: "Project-reported engineering results",
    repo: "https://github.com/Am-create7754/Shadow-AI-Guardrail",
  },
  {
    id: "maddoc",
    slug: "maddoc",
    index: "CS/03",
    name: "MaDDoC",
    accent: "MaDDoC",
    short:
      "A multi-role healthcare marketplace where patients, doctors and administrators each get a workflow shaped around their own goals.",
    category: "Healthcare Product Experience",
    status: "progress",
    tags: ["product"],
    task: "Make finding, booking and managing care understandable for three different roles",
    input: "Patients, doctors, admins",
    output: "Role-specific flows and dashboards",
    role: "Full-stack development and product flows",
    stack: ["React", "Node.js", "PostgreSQL", "Prisma", "Razorpay", "Daily"],
    metrics: [{ value: 3, label: "user roles, one product" }],
    repo: "https://github.com/Am-create7754/MaDDoc",
  },
  {
    id: "design",
    slug: "design-workflow-assistant",
    index: "CS/04",
    name: "AI Design Workflow Assistant",
    accent: "Workflow",
    short:
      "An exploratory prototype: one lightweight tool that organises a design brief, concept directions, CMF options and review feedback into next steps.",
    category: "Exploratory Concept",
    status: "concept",
    tags: ["design", "agents"],
    task: "Reduce repetitive coordination and documentation in design reviews",
    input: "Brief, concepts, review comments",
    output: "Requirements, open questions, prioritised tasks",
    role: "Independent concept, interaction design and prototype",
    stack: ["React", "TypeScript", "Deterministic local logic"],
    metrics: [],
    repo: null,
  },
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
