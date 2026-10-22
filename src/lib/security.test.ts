import { describe, expect, it } from "vitest";
import { CONTACT_LIMITS, contactPayload, safeExternalUrl, safeMailto, validateContact } from "./security";
import { PROFILE } from "../data/profile";
import { PROJECTS } from "../data/projects";
import { FREELANCE } from "../data/profile";

const good = { name: "Riya Kapoor", email: "riya@example.com", need: "Internship opportunity", message: "Hello — I'd like to talk about the role.", "bot-field": "" };

describe("safeExternalUrl", () => {
  it("allows https links to allowlisted hosts", () => {
    expect(safeExternalUrl("https://github.com/Am-create7754")).toBe("https://github.com/Am-create7754");
    expect(safeExternalUrl("https://www.linkedin.com/in/x")).toBe("https://www.linkedin.com/in/x");
  });

  it("rejects dangerous schemes, plain http, credentials and unknown hosts", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      " javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "http://github.com/Am-create7754",
      "https://user:pass@github.com/",
      "https://github.com.evil.example/",
      "https://evil.example/github.com",
      "//github.com/Am-create7754",
      "/relative/path",
      "",
      null,
      undefined,
    ]) {
      expect(safeExternalUrl(bad as string)).toBeNull();
    }
  });

  it("every outbound link in the site data passes the allowlist", () => {
    const links = [PROFILE.links.github, PROFILE.links.linkedin, FREELANCE.live.url, ...PROJECTS.map((p) => p.repo).filter(Boolean)];
    for (const l of links) expect(safeExternalUrl(l)).not.toBeNull();
  });
});

describe("safeMailto", () => {
  it("builds mailto for valid addresses only", () => {
    expect(safeMailto("ambersahay18@gmail.com")).toBe("mailto:ambersahay18@gmail.com");
    expect(safeMailto("a@b.co?cc=evil@x.com")).toBeNull();
    expect(safeMailto("a@b.co\r\nBcc: evil@x.com")).toBeNull();
    expect(safeMailto("javascript:alert(1)")).toBeNull();
    expect(safeMailto(null)).toBeNull();
  });
});

describe("validateContact", () => {
  it("accepts a normal message and trims it", () => {
    const r = validateContact({ ...good, name: "  Riya Kapoor  " });
    expect(r).toEqual({ ok: true, data: { name: "Riya Kapoor", email: "riya@example.com", need: "Internship opportunity", message: good.message } });
  });

  it("flags filled honeypots as spam without revealing why", () => {
    expect(validateContact({ ...good, "bot-field": "http://spam" })).toEqual({ ok: false, spam: true });
  });

  it("blocks header-injection attempts in single-line fields", () => {
    const r1 = validateContact({ ...good, name: "Riya\r\nBcc: victim@example.com" });
    const r2 = validateContact({ ...good, email: "riya@example.com\nBcc: victim@example.com" });
    expect(r1.ok).toBe(false);
    expect(r2.ok).toBe(false);
    if (!r1.ok && !r1.spam) expect(r1.errors.name).toBeDefined();
    if (!r2.ok && !r2.spam) expect(r2.errors.email).toBeDefined();
  });

  it("enforces length limits", () => {
    const long = validateContact({ ...good, message: "x".repeat(CONTACT_LIMITS.message + 1), name: "n".repeat(CONTACT_LIMITS.name + 1) });
    expect(long.ok).toBe(false);
    if (!long.ok && !long.spam) {
      expect(long.errors.message).toBeDefined();
      expect(long.errors.name).toBeDefined();
    }
    const short = validateContact({ ...good, message: "hi" });
    expect(short.ok).toBe(false);
  });

  it("rejects malformed bodies: wrong types, missing fields, unknown topics", () => {
    const r = validateContact({ name: 42, email: ["a@b.co"], need: "<script>", message: { x: 1 } });
    expect(r.ok).toBe(false);
    if (!r.ok && !r.spam) expect(Object.keys(r.errors).sort()).toEqual(["email", "message", "name", "need"]);
    expect(validateContact({}).ok).toBe(false);
  });

  it("strips control characters but keeps newlines in the message", () => {
    const r = validateContact({ ...good, message: "Line one\u0000\u0007\r\nLine two is here" });
    expect(r.ok && r.data.message).toBe("Line one\nLine two is here");
  });

  it("drops unexpected fields from the outgoing payload", () => {
    const r = validateContact({ ...good, admin: "true", "form-name": "other" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const body = new URLSearchParams(contactPayload(r.data));
      expect([...body.keys()].sort()).toEqual(["bot-field", "email", "form-name", "message", "name", "need"]);
      expect(body.get("form-name")).toBe("contact");
      expect(body.get("admin")).toBeNull();
    }
  });

  it("does not treat HTML in the message as anything but text", () => {
    const r = validateContact({ ...good, message: "<img src=x onerror=alert(1)> hello there" });
    expect(r.ok && r.data.message).toBe("<img src=x onerror=alert(1)> hello there");
  });
});
