// Post-build safety check for everything that would be published from dist/.
// Fails (exit 1) if the bundle contains credential-shaped strings, source maps,
// environment references, inline scripts, or dotfiles.
//   npm run build && node scripts/check-bundle.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = "dist";
const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p) : files.push(p);
  }
};
walk(root);

// High-signal credential formats. Synthetic demo strings (e.g. "token_DEMO…") deliberately don't match these.
const SECRET_PATTERNS = [
  ["OpenAI/Anthropic-style key", /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Stripe live key", /\b[rs]k_live_[0-9A-Za-z]{20,}/],
  ["Private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
];

const problems = [];
for (const f of files) {
  const rel = relative(root, f).replace(/\\/g, "/");
  if (rel.endsWith(".map")) problems.push(`${rel}: source map would be published`);
  if (rel.split("/").some((part) => part.startsWith(".") )) problems.push(`${rel}: dotfile would be published`);
  if (!/\.(js|css|html|svg|json|txt)$/.test(rel) && rel !== "_headers" && rel !== "_redirects") continue;
  const text = readFileSync(f, "utf8");
  for (const [name, re] of SECRET_PATTERNS) if (re.test(text)) problems.push(`${rel}: looks like a ${name}`);
  if (/import\.meta\.env|process\.env/.test(text)) problems.push(`${rel}: references environment variables`);
  if (rel.endsWith(".html")) {
    for (const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc=/.test(m[1]) || m[2].trim()) problems.push(`${rel}: inline <script> would violate the CSP`);
    }
    if (/\son[a-z]+\s*=/i.test(text)) problems.push(`${rel}: inline event handler attribute`);
    if (/\sstyle\s*=/i.test(text)) problems.push(`${rel}: inline style attribute would violate the CSP`);
  }
}

if (problems.length) {
  console.error(`Bundle check failed (${problems.length}):\n - ${problems.join("\n - ")}`);
  process.exit(1);
}
console.log(`Bundle check passed: ${files.length} files, no secrets, source maps, env references or inline scripts/styles.`);
