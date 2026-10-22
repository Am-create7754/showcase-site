// Guards the deployment security headers: Netlify (_headers) and Vercel (vercel.json)
// must send the same policy, and the CSP must stay strict.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function netlifyHeaders(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  let active = false;
  for (const line of readFileSync("public/_headers", "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      active = new RegExp(`^${line.trim().replace(/\*/g, ".*")}$`).test(path);
    } else if (active) {
      const i = line.indexOf(":");
      out[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    }
  }
  return out;
}

function vercelHeaders(path: string): Record<string, string> {
  const cfg = JSON.parse(readFileSync("vercel.json", "utf8")) as { headers: { source: string; headers: { key: string; value: string }[] }[] };
  const out: Record<string, string> = {};
  for (const block of cfg.headers) {
    if (new RegExp(`^${block.source}$`).test(path)) for (const h of block.headers) out[h.key.toLowerCase()] = h.value;
  }
  return out;
}

const csp = (h: Record<string, string>) =>
  Object.fromEntries(
    h["content-security-policy"].split(";").map((d) => {
      const [name, ...vals] = d.trim().split(/\s+/);
      return [name, vals];
    }),
  ) as Record<string, string[]>;

describe("deployment security headers", () => {
  for (const path of ["/", "/work/maddoc", "/assets/index-abc123.js"]) {
    it(`Netlify and Vercel send the same headers for ${path}`, () => {
      expect(vercelHeaders(path)).toEqual(netlifyHeaders(path));
    });
  }

  it("sends the baseline browser protections", () => {
    const h = netlifyHeaders("/");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["strict-transport-security"]).toMatch(/max-age=\d{7,}/);
    expect(h["permissions-policy"]).toContain("camera=()");
  });

  it("keeps the CSP strict: no inline/eval script or style, no framing, no plugins", () => {
    const p = csp(netlifyHeaders("/"));
    expect(p["default-src"]).toEqual(["'self'"]);
    expect(p["script-src"]).toEqual(["'self'"]);
    expect(p["style-src"]).not.toContain("'unsafe-inline'");
    for (const list of Object.values(p)) {
      expect(list).not.toContain("'unsafe-eval'");
      expect(list).not.toContain("*");
      expect(list.some((v) => v === "http:" || v.startsWith("http://"))).toBe(false);
    }
    expect(p["frame-ancestors"]).toEqual(["'none'"]);
    expect(p["object-src"]).toEqual(["'none'"]);
    expect(p["base-uri"]).toEqual(["'self'"]);
    expect(p["form-action"]).toEqual(["'self'"]);
  });

  it("only allows third-party origins the site actually uses (Google Fonts)", () => {
    const p = csp(netlifyHeaders("/"));
    const external = Object.values(p).flat().filter((v) => v.startsWith("https://"));
    expect([...new Set(external)].sort()).toEqual(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
  });

  it("caches fingerprinted assets long-term but not the HTML shell", () => {
    expect(netlifyHeaders("/assets/index-abc123.js")["cache-control"]).toContain("immutable");
    expect(netlifyHeaders("/")["cache-control"]).toBeUndefined();
  });
});
