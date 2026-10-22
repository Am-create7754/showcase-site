// Deterministic local logic for the AI Design Workflow Assistant CONCEPT PROTOTYPE.
// No language model is called. Each function is a stand-in for where an AI step could
// sit in a real tool, written so its behaviour is predictable and testable.

export interface Brief {
  projectName: string;
  category: string;
  targetUser: string;
  goals: string;
  constraints: string;
  references: string;
}

export const BRIEF_FIELDS: { key: keyof Brief; label: string; multiline: boolean }[] = [
  { key: "projectName", label: "Project name", multiline: false },
  { key: "category", label: "Product category", multiline: false },
  { key: "targetUser", label: "Target user", multiline: true },
  { key: "goals", label: "Design goals", multiline: true },
  { key: "constraints", label: "Functional constraints", multiline: true },
  { key: "references", label: "Reference notes", multiline: true },
];

export interface OrganizedBrief {
  coreGoals: string[];
  constraints: string[];
  userNeeds: string[];
  openQuestions: string[];
  criteria: string[];
}

export function splitItems(text: string): string[] {
  return text
    .split(/\n|;|(?<=\.)\s+/)
    .map((s) => s.replace(/^[\s\-•*\d.)]+/, "").replace(/\.$/, "").trim())
    .filter((s) => s.length > 2);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function isFilled(v: string): boolean {
  return v.trim().length >= 3;
}

export function briefCompleteness(brief: Brief): number {
  const filled = BRIEF_FIELDS.filter((f) => isFilled(brief[f.key])).length;
  return Math.round((filled / BRIEF_FIELDS.length) * 100);
}

const QUESTION_CHECKS: { test: RegExp; question: string }[] = [
  { test: /cost|price|budget|₹|inr/i, question: "What is the target cost bracket for the product?" },
  { test: /weight|\bkg\b|light(?:weight)?/i, question: "Is there a target weight, and how does it trade off against storage?" },
  { test: /material|finish|cmf|texture|colou?r/i, question: "Are any materials or finishes preferred or excluded?" },
  { test: /climate|rain|monsoon|heat|weather|dust/i, question: "Which climate conditions (heat, monsoon, dust) must surfaces handle?" },
  { test: /regulat|standard|complian|homologat/i, question: "Which regulations or standards constrain the design?" },
  { test: /milestone|deadline|timeline|review date|week/i, question: "What are the review milestones and deliverables for each?" },
  { test: /height|ergonom|size range|percentile/i, question: "What rider size range should ergonomics support?" },
];

const CRITERIA_MAP: { test: RegExp; criterion: string }[] = [
  { test: /storage|boot|carry/i, criterion: "Usable storage volume versus packaging space" },
  { test: /service|maintain|repair/i, criterion: "Ease of reaching and servicing common parts" },
  { test: /durab|robust|scratch|wear/i, criterion: "Durability of exposed surfaces and finishes" },
  { test: /simpl|intuitive|control|display|dashboard/i, criterion: "Control clarity: can a first-time rider operate it without instruction?" },
  { test: /access|step|inclusive|reach|height/i, criterion: "Accessibility across rider sizes and abilities" },
  { test: /premium|brand|identity|calm|character/i, criterion: "Consistency with the intended visual character" },
  { test: /safe|visib|light|night/i, criterion: "Visibility and perceived safety in traffic and low light" },
  { test: /comfort|posture|seat/i, criterion: "Seated comfort and posture for daily commutes" },
];

const NEED_WORDS = /rider|user|comfort|access|easy|intuitive|safe|carry|park|family|commut/i;

export function organizeBrief(brief: Brief): OrganizedBrief {
  const coreGoals = splitItems(brief.goals).map(cap);
  const constraints = splitItems(brief.constraints).map(cap);

  const userNeeds = [
    ...splitItems(brief.targetUser).map(cap),
    ...coreGoals.filter((g) => NEED_WORDS.test(g)).map((g) => `Implied by goal: ${g.charAt(0).toLowerCase()}${g.slice(1)}`),
  ];

  const all = Object.values(brief).join(" ");
  const openQuestions = [
    ...splitItems(brief.references).filter((r) => r.includes("?")).map(cap),
    ...QUESTION_CHECKS.filter((c) => !c.test.test(all)).map((c) => c.question),
  ];

  const criteria: string[] = [];
  for (const g of coreGoals) {
    const hit = CRITERIA_MAP.find((c) => c.test.test(g));
    const criterion = hit ? hit.criterion : `Goal fit: ${g}`;
    if (!criteria.includes(criterion)) criteria.push(criterion);
  }

  return { coreGoals, constraints, userNeeds, openQuestions, criteria };
}

export type Priority = "High" | "Medium" | "Low";
export type Category = "Accessibility" | "Controls & layout" | "Durability" | "CMF" | "Cost" | "Visibility & safety" | "General";

export interface Task {
  id: string;
  text: string;
  category: Category;
  priority: Priority;
  nextStep: string;
  done: boolean;
}

const CATEGORY_RULES: { test: RegExp; category: Category; nextStep: string }[] = [
  { test: /access|readab|contrast|reach|inclusive|glove/i, category: "Accessibility", nextStep: "Check reach and readability across small and large rider sizes" },
  { test: /control|layout|button|switch|display|screen|ui\b|simplif|cluster/i, category: "Controls & layout", nextStep: "Sketch two simplified layouts and compare them side by side" },
  { test: /durab|scratch|wear|weather|robust|impact|scuff/i, category: "Durability", nextStep: "List high-contact surfaces and the wear each must survive" },
  { test: /finish|colou?r|material|texture|cmf|matte|gloss|paint/i, category: "CMF", nextStep: "Add the alternatives to the CMF board for a side-by-side review" },
  { test: /visib|indicator|lamp|light|reflect|night/i, category: "Visibility & safety", nextStep: "Mock up lamp and indicator placement and check it in low-light conditions" },
  { test: /cost|price|budget|expensive/i, category: "Cost", nextStep: "Flag to engineering for an early cost estimate" },
];

export function priorityOf(text: string): Priority {
  if (/must|safety|critical|urgent|block|accessib|cannot|can't/i.test(text)) return "High";
  if (/nice to have|maybe|consider|later|explore|could/i.test(text)) return "Low";
  return "Medium";
}

export function organizeFeedback(text: string): Task[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter((l) => l.length > 2)
    .map((line, i) => {
      const rule = CATEGORY_RULES.find((r) => r.test.test(line));
      return {
        id: `t${i}`,
        text: cap(line.replace(/\.$/, "")),
        category: rule?.category ?? "General",
        priority: priorityOf(line),
        nextStep: rule?.nextStep ?? "Discuss in the next review and assign an owner",
        done: false,
      };
    })
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export interface WorkflowState {
  brief: Brief;
  organized: OrganizedBrief | null;
  resolvedQuestions: string[];
  shortlisted: string[];
  cmfSelection: string | null;
  tasks: Task[];
}

export interface WorkflowSummary {
  completeness: number;
  missingFields: string[];
  outstandingQuestions: number;
  openTasks: number;
  highPriorityOpen: number;
  doneTasks: number;
  nextSteps: string[];
}

export function summarize(s: WorkflowState): WorkflowSummary {
  const completeness = briefCompleteness(s.brief);
  const missingFields = BRIEF_FIELDS.filter((f) => !isFilled(s.brief[f.key])).map((f) => f.label);
  const outstandingQuestions = s.organized ? s.organized.openQuestions.filter((q) => !s.resolvedQuestions.includes(q)).length : 0;
  const openTasks = s.tasks.filter((t) => !t.done).length;
  const highPriorityOpen = s.tasks.filter((t) => !t.done && t.priority === "High").length;
  const doneTasks = s.tasks.length - openTasks;

  const nextSteps: string[] = [];
  if (missingFields.length) nextSteps.push(`Complete the brief: ${missingFields.join(", ").toLowerCase()}`);
  if (!s.organized) nextSteps.push("Organize the brief into requirements");
  if (outstandingQuestions) nextSteps.push(`Resolve ${outstandingQuestions} open question${outstandingQuestions > 1 ? "s" : ""} with the project lead`);
  if (!s.shortlisted.length) nextSteps.push("Shortlist at least one concept direction");
  if (!s.cmfSelection) nextSteps.push("Pick a CMF combination to carry into the review");
  if (!s.tasks.length) nextSteps.push("Capture review feedback and organize it into tasks");
  if (highPriorityOpen) nextSteps.push(`Address ${highPriorityOpen} high-priority review task${highPriorityOpen > 1 ? "s" : ""} first`);
  else if (openTasks) nextSteps.push(`Work through ${openTasks} remaining review task${openTasks > 1 ? "s" : ""}`);
  if (!nextSteps.length) nextSteps.push("Everything is captured — prepare material for the next design review");

  return { completeness, missingFields, outstandingQuestions, openTasks, highPriorityOpen, doneTasks, nextSteps };
}
