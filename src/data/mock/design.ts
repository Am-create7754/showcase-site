// FICTIONAL sample content for the AI Design Workflow Assistant concept prototype.
// "Kestrel" is an invented project. None of this describes a real product or company.

import type { Brief } from "../../lib/designAssistant";

export const SAMPLE_BRIEF: Brief = {
  projectName: "Project Kestrel (fictional)",
  category: "Urban electric scooter",
  targetUser:
    "Daily city commuters riding 10–25 km a day\nFirst-time scooter owners who want something easy to live with\nRiders who park on busy streets and in tight basements",
  goals:
    "Make the controls feel simple and intuitive\nMore usable under-seat storage than the previous model\nA calm, premium visual character\nEasy access to common service parts\nBetter visibility at night",
  constraints:
    "Fixed battery pack position under the floorboard\nMust fit a full-face helmet under the seat\nReuse the existing hub motor and wheelbase\nSeat height must suit shorter riders",
  references:
    "Riders mention scuffed side panels after a year of use\nCompetitors lean on large touchscreens — is that actually needed?\nInterest in a single accent colour rather than full-body graphics",
};

export const SAMPLE_FEEDBACK = `Must improve accessibility of the side stand for shorter riders
Simplify the control layout on the left switch cube
Investigate durability of the side panels against scuffs
Compare alternative finishes for the floorboard
Maybe explore a warmer grey colour for the seat
Indicator visibility at night is a safety concern`;

export interface Concept {
  id: string;
  code: string;
  name: string;
  rationale: string;
  objective: string;
  pros: string[];
  cons: string[];
  variant: "monolith" | "exo" | "arc";
}

export const CONCEPTS: Concept[] = [
  {
    id: "monolith",
    code: "DIR-A",
    name: "Monolith",
    rationale: "One calm volume. Battery, storage and body read as a single wrapped form with very few visible splits.",
    objective: "Feel solid and effortless — nothing on the vehicle asks to be figured out.",
    pros: ["Clean, premium silhouette", "Fewer seams to clean"],
    cons: ["Harder access to service parts", "Large panels make scuffs visible"],
    variant: "monolith",
  },
  {
    id: "exo",
    code: "DIR-B",
    name: "Exo",
    rationale: "An exposed structural spine carries smaller, replaceable panels. Function is visible rather than hidden.",
    objective: "Honest and repairable — a scuffed panel is a swap, not a respray.",
    pros: ["Panels replaceable after wear", "Direct service access"],
    cons: ["Busier visual language", "Higher part count"],
    variant: "exo",
  },
  {
    id: "arc",
    code: "DIR-C",
    name: "Arc",
    rationale: "A single continuous line from headlamp to tail, with a low step-through floor.",
    objective: "Approachable for shorter and first-time riders from the very first step-in.",
    pros: ["Low, friendly step-in", "Strong recognisable line"],
    cons: ["Less storage volume", "Line constrains packaging"],
    variant: "arc",
  },
];

export interface Swatch {
  id: string;
  name: string;
  finish: string;
  className: string;
}

export const SWATCHES: Swatch[] = [
  { id: "graphite", name: "Graphite", finish: "Matte", className: "sw-graphite" },
  { id: "paper", name: "Paper White", finish: "Satin", className: "sw-paper" },
  { id: "signal", name: "Signal Orange", finish: "Gloss accent", className: "sw-signal" },
  { id: "alu", name: "Aluminium", finish: "Brushed", className: "sw-alu" },
  { id: "pp", name: "Recycled PP", finish: "Textured grain", className: "sw-pp" },
  { id: "slate", name: "Slate Blue", finish: "Matte", className: "sw-slate" },
];

export interface CmfCombo {
  id: string;
  name: string;
  body: string;
  trim: string;
  accent: string;
  note: string;
}

export const CMF_COMBOS: CmfCombo[] = [
  { id: "calm", name: "Calm Graphite", body: "graphite", trim: "alu", accent: "signal", note: "Dark matte body hides wear; one orange accent at the dash." },
  { id: "daylight", name: "Daylight", body: "paper", trim: "pp", accent: "graphite", note: "Light body with textured lower panels that shrug off scuffs." },
  { id: "night", name: "Night Signal", body: "slate", trim: "graphite", accent: "signal", note: "Cool body colour; accent placed near lamps for night visibility." },
];
