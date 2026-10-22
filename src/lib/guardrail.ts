// Deterministic client-side policy engine for the PORTFOLIO DEMO of the AppSec Guardrail.
// It mirrors the documented decision model (allow / redact / hold / block) using simple
// pattern rules. It is not the project's real detection engine.

export type Severity = "low" | "medium" | "high" | "critical";
export type Decision = "ALLOW" | "REDACT" | "HOLD" | "BLOCK";
export type Role = "engineer" | "contractor" | "security-admin";

export interface Finding {
  rule: string;
  label: string;
  severity: Severity;
  start: number;
  end: number;
  preview: string;
}

export interface Inspection {
  findings: Finding[];
  decision: Decision;
  redacted: string;
  reasons: string[];
}

interface Rule {
  id: string;
  label: string;
  severity: Severity;
  pattern: RegExp;
  validate?: (match: string) => boolean;
}

export function luhnValid(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export const RULES: Rule[] = [
  {
    id: "private-key",
    label: "Private key block",
    severity: "critical",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g,
  },
  {
    id: "api-secret",
    label: "API key / token",
    severity: "critical",
    pattern: /\b(?:sk|pk|api|key|tok|token|ghp|xoxb)[-_][A-Za-z0-9_-]{12,}\b/gi,
  },
  {
    id: "password",
    label: "Password assignment",
    severity: "critical",
    pattern: /\b(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{4,}["']?/gi,
  },
  {
    id: "card",
    label: "Payment card number",
    severity: "high",
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    validate: luhnValid,
  },
  {
    id: "gov-id",
    label: "Government ID (Aadhaar-style)",
    severity: "high",
    pattern: /\b\d{4}\s\d{4}\s\d{4}\b/g,
  },
  {
    id: "email",
    label: "Email address",
    severity: "medium",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    id: "phone",
    label: "Phone number",
    severity: "medium",
    pattern: /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g,
  },
  {
    id: "confidential",
    label: "Confidentiality marker",
    severity: "medium",
    pattern: /\b(?:confidential|internal only|do not distribute|under nda)\b/gi,
  },
];

const CODE_SIGNALS = [/\bdef \w+\(/, /\bfunction \w*\(/, /\bimport \w+/, /\bclass \w+/, /=>\s*{/, /;\s*$/m, /\bconst \w+\s*=/];

/** Heuristic: two or more code signals counts as a pasted source-code block. */
export function looksLikeCode(text: string): boolean {
  return CODE_SIGNALS.filter((r) => r.test(text)).length >= 2;
}

const RANK: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

function mask(s: string): string {
  const t = s.trim();
  if (t.length <= 6) return "•".repeat(t.length);
  return `${t.slice(0, 3)}${"•".repeat(Math.min(10, t.length - 5))}${t.slice(-2)}`;
}

export function detect(text: string): Finding[] {
  const found: Finding[] = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    for (const m of text.matchAll(rule.pattern)) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (rule.validate && !rule.validate(m[0])) continue;
      // Skip matches already covered by a higher-priority rule (e.g. digits inside a key).
      if (found.some((f) => start < f.end && end > f.start)) continue;
      found.push({ rule: rule.id, label: rule.label, severity: rule.severity, start, end, preview: mask(m[0]) });
    }
  }
  if (looksLikeCode(text)) {
    found.push({ rule: "source-code", label: "Source code block", severity: "low", start: -1, end: -1, preview: "multi-line code" });
  }
  return found.sort((a, b) => a.start - b.start);
}

export function redact(text: string, findings: Finding[]): string {
  const spans = findings.filter((f) => f.start >= 0).sort((a, b) => b.start - a.start);
  let out = text;
  for (const f of spans) {
    out = out.slice(0, f.start) + `[REDACTED:${f.rule.toUpperCase()}]` + out.slice(f.end);
  }
  return out;
}

/**
 * Policy (demo): critical secrets are always blocked; high-risk identifiers are held for
 * approval; medium personal data is redacted; source code is allowed for engineers but
 * held for contractors. Security admins may send redacted high-risk content.
 */
export function decide(findings: Finding[], role: Role): { decision: Decision; reasons: string[] } {
  if (findings.length === 0) return { decision: "ALLOW", reasons: ["No sensitive content detected by the active rules."] };
  const reasons: string[] = [];
  const max = Math.max(...findings.map((f) => RANK[f.severity]));
  const has = (id: string) => findings.some((f) => f.rule === id);

  if (max === RANK.critical) {
    const crit = [...new Set(findings.filter((f) => f.severity === "critical").map((f) => f.label.toLowerCase()))];
    reasons.push(`Contains ${crit.join(" and ")} — secrets are never forwarded, for any role.`);
    return { decision: "BLOCK", reasons };
  }
  if (max === RANK.high) {
    const hi = [...new Set(findings.filter((f) => f.severity === "high").map((f) => f.label.toLowerCase()))];
    if (role === "security-admin") {
      reasons.push(`Contains ${hi.join(" and ")}; security admins may send it once redacted.`);
      return { decision: "REDACT", reasons };
    }
    reasons.push(`Contains ${hi.join(" and ")} — held until a security admin approves.`);
    return { decision: "HOLD", reasons };
  }
  if (has("source-code") && role === "contractor") {
    reasons.push("Source code from a contractor account requires approval before leaving the organisation.");
    return { decision: "HOLD", reasons };
  }
  const medium = findings.filter((f) => f.severity === "medium");
  if (medium.length) {
    reasons.push(
      `Redacted ${medium.length} item${medium.length > 1 ? "s" : ""} (${[...new Set(medium.map((f) => f.label.toLowerCase()))].join(", ")}); the rest of the prompt is safe to send.`,
    );
  }
  if (has("source-code")) reasons.push("Source code is permitted for the engineer role under the active policy.");
  return { decision: medium.length ? "REDACT" : "ALLOW", reasons };
}

export function inspect(text: string, role: Role): Inspection {
  const findings = detect(text);
  const { decision, reasons } = decide(findings, role);
  const redacted = decision === "BLOCK" ? "" : redact(text, findings);
  return { findings, decision, redacted, reasons };
}

/** HMAC-SHA256 chain, as the real system does for its audit log — here with a demo key in the browser. */
export async function chainHash(prevHash: string, payload: string): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return null;
  const enc = new TextEncoder();
  const key = await subtle.importKey("raw", enc.encode("portfolio-demo-key"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await subtle.sign("HMAC", key, enc.encode(prevHash + "|" + payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
