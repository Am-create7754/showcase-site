// SYNTHETIC data for the AppSec Guardrail portfolio demo. Every value is fake.

import type { Decision, Role } from "../../lib/guardrail";

export const ROLES: { id: Role; label: string }[] = [
  { id: "engineer", label: "Engineer" },
  { id: "contractor", label: "Contractor" },
  { id: "security-admin", label: "Security admin" },
];

export const SAMPLE_PROMPTS: { label: string; text: string }[] = [
  {
    label: "Personal data",
    text: "Rewrite this delivery update for the customer at priya.demo@example.com, phone 98765 43210. Keep it friendly and under 80 words.",
  },
  {
    label: "Secret in code",
    text: "Why does this request return 401?\n\nimport requests\ndef fetch():\n    return requests.get(url, headers={\"Authorization\": \"token_DEMO1234567890FAKEVALUE\"})",
  },
  {
    label: "Payment card",
    text: "A user says card 4111 1111 1111 1111 was charged twice. Draft an apology email explaining the refund timeline.",
  },
  {
    label: "Clean prompt",
    text: "Suggest three ways to make our onboarding checklist easier to scan on mobile.",
  },
];

export interface AuditEvent {
  id: string;
  time: string;
  user: string;
  role: Role;
  decision: Decision;
  rules: string[];
  hash: string;
  source: "seed" | "session";
}

export const SEED_EVENTS: AuditEvent[] = [
  { id: "ev-1041", time: "09:12", user: "dev.alpha", role: "engineer", decision: "ALLOW", rules: [], hash: "3f9a…c21e", source: "seed" },
  { id: "ev-1042", time: "09:30", user: "dev.bravo", role: "engineer", decision: "REDACT", rules: ["email"], hash: "a71c…09bd", source: "seed" },
  { id: "ev-1043", time: "10:05", user: "ctr.charlie", role: "contractor", decision: "HOLD", rules: ["source-code"], hash: "5be0…77f3", source: "seed" },
  { id: "ev-1044", time: "10:48", user: "dev.delta", role: "engineer", decision: "BLOCK", rules: ["api-secret"], hash: "e204…4a8c", source: "seed" },
  { id: "ev-1045", time: "11:20", user: "dev.echo", role: "engineer", decision: "ALLOW", rules: [], hash: "9cd2…1f60", source: "seed" },
  { id: "ev-1046", time: "11:57", user: "ctr.foxtrot", role: "contractor", decision: "HOLD", rules: ["card"], hash: "07ab…e3d9", source: "seed" },
];

export const USERS = [
  { user: "dev.alpha", role: "Engineer", team: "Platform", status: "Active" },
  { user: "dev.bravo", role: "Engineer", team: "Payments", status: "Active" },
  { user: "ctr.charlie", role: "Contractor", team: "Mobile", status: "Active" },
  { user: "sec.admin", role: "Security admin", team: "Security", status: "Active" },
  { user: "ctr.foxtrot", role: "Contractor", team: "Support", status: "Suspended" },
];

export const POLICY_TABLE: { rule: string; severity: string; engineer: Decision; contractor: Decision; admin: Decision }[] = [
  { rule: "API keys, tokens, private keys, passwords", severity: "Critical", engineer: "BLOCK", contractor: "BLOCK", admin: "BLOCK" },
  { rule: "Payment cards, government IDs", severity: "High", engineer: "HOLD", contractor: "HOLD", admin: "REDACT" },
  { rule: "Emails, phone numbers, confidentiality markers", severity: "Medium", engineer: "REDACT", contractor: "REDACT", admin: "REDACT" },
  { rule: "Source code", severity: "Low", engineer: "ALLOW", contractor: "HOLD", admin: "ALLOW" },
];
