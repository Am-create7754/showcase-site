// Serves the production build (dist/) the way Netlify would for this site:
// headers from dist/_headers, SPA fallback to index.html, nothing outside dist/.
// Used to verify the CSP and headers against the real bundle before deploying.
//   node scripts/serve-dist.mjs [port]
import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve("dist");
const port = Number(process.argv[2] ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".json": "application/json",
};

/** Parse Netlify's _headers format into [{ pattern: RegExp, headers: [name, value][] }]. */
function loadHeaderRules() {
  const rules = [];
  let current = null;
  for (const raw of readFileSync(join(root, "_headers"), "utf8").split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    if (!/^\s/.test(raw)) {
      const glob = raw.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      current = { pattern: new RegExp(`^${glob}$`), headers: [] };
      rules.push(current);
    } else if (current) {
      const i = raw.indexOf(":");
      current.headers.push([raw.slice(0, i).trim(), raw.slice(i + 1).trim()]);
    }
  }
  return rules;
}

const rules = loadHeaderRules();

function fileFor(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const target = normalize(join(root, decoded));
  if (target !== root && !target.startsWith(root + sep)) return null; // path traversal
  try {
    const st = statSync(target);
    if (st.isFile()) return target;
    if (st.isDirectory()) {
      const index = join(target, "index.html");
      if (statSync(index).isFile()) return index;
    }
  } catch {
    /* not found */
  }
  return null;
}

createServer((req, res) => {
  const path = (req.url ?? "/").split("?")[0];
  for (const r of rules) if (r.pattern.test(path)) for (const [k, v] of r.headers) res.setHeader(k, v);

  if (req.method !== "GET" && req.method !== "HEAD") {
    // Netlify Forms handles POST / in production; locally there is no form backend.
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    return;
  }
  let file = null;
  try {
    file = fileFor(path);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain" }).end("Bad request");
    return;
  }
  // Hidden/dot files are never served; unknown paths fall back to the SPA shell (like _redirects).
  if (!file || /(^|[\\/])\.[^\\/]+/.test(file.slice(root.length))) file = join(root, "index.html");
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(req.method === "HEAD" ? undefined : readFileSync(file));
}).listen(port, () => console.log(`Serving dist/ with production headers on http://localhost:${port}`));
