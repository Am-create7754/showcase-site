import { describe, expect, it } from "vitest";
import { chainHash, decide, detect, inspect, looksLikeCode, luhnValid, redact } from "./guardrail";

describe("guardrail demo policy engine", () => {
  it("allows clean prompts", () => {
    const r = inspect("Summarise the attached meeting notes in three bullet points.", "engineer");
    expect(r.decision).toBe("ALLOW");
    expect(r.findings).toHaveLength(0);
    expect(r.redacted).toBe("Summarise the attached meeting notes in three bullet points.");
  });

  it("blocks secrets for every role", () => {
    for (const role of ["engineer", "contractor", "security-admin"] as const) {
      const r = inspect("Why does this fail? key_DEMO000000000000FAKE", role);
      expect(r.decision).toBe("BLOCK");
      expect(r.redacted).toBe("");
    }
  });

  it("redacts personal data and keeps the rest", () => {
    const r = inspect("Draft a reply to test.user@example.com about the delivery.", "engineer");
    expect(r.decision).toBe("REDACT");
    expect(r.redacted).toBe("Draft a reply to [REDACTED:EMAIL] about the delivery.");
  });

  it("holds Luhn-valid card numbers but ignores random digit runs", () => {
    expect(luhnValid("4111 1111 1111 1111")).toBe(true);
    expect(luhnValid("4111 1111 1111 1112")).toBe(false);
    expect(inspect("Card 4111 1111 1111 1111 was declined", "engineer").decision).toBe("HOLD");
    expect(detect("Order 4111 1111 1111 1112").some((f) => f.rule === "card")).toBe(false);
  });

  it("lets security admins send high-risk content once redacted", () => {
    expect(inspect("ID 1234 5678 9012 needs review", "security-admin").decision).toBe("REDACT");
  });

  it("treats source code differently by role", () => {
    const code = "import os\ndef load():\n    return os.environ\n";
    expect(looksLikeCode(code)).toBe(true);
    expect(decide(detect(code), "engineer").decision).toBe("ALLOW");
    expect(decide(detect(code), "contractor").decision).toBe("HOLD");
  });

  it("redacts multiple spans without corrupting offsets", () => {
    const text = "a@b.co and c@d.io";
    expect(redact(text, detect(text))).toBe("[REDACTED:EMAIL] and [REDACTED:EMAIL]");
  });

  it("chains audit hashes deterministically", async () => {
    const h1 = await chainHash("genesis", "event-1");
    const h2 = await chainHash("genesis", "event-1");
    const h3 = await chainHash(h1 ?? "", "event-2");
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).toBe(h2);
    expect(h3).not.toBe(h1);
  });
});
