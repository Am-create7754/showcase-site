# Amber Sahay — Portfolio (AI Generalist · Design)

A multi-page portfolio built for the AI Generalist (Design) internship application. Its visual language is **SIGNAL**: a lab notebook on warm paper with a calm system running underneath. Headings decode from glyphs, the hero console streams answers, a dot-field reacts to the cursor, and projects appear as "model cards".

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build locally
```

Requires Node 18+ (built and tested on Node 22).

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: hero console, toolbelt, capabilities, model cards, process, skills, about teaser |
| `/work` | All projects with filters (`?tag=agents` etc.) |
| `/work/ipl-intelligence` | Case study + interactive analytics demo |
| `/work/shadow-ai-guardrail` | Case study + developer/admin guardrail demo |
| `/work/maddoc` | Case study + multi-role product showcase |
| `/work/design-workflow-assistant` | Exploratory design-workflow prototype |
| `/about` | Narrative, working approach, skills, leadership |
| `/resume` | Print-friendly, ATS-friendly resume |

Every route works when you open it directly. Netlify uses `public/_redirects` for this and Vercel uses `vercel.json`.

## Editing content

All personal content is in **`src/data/profile.ts`** (email, links, education, freelance, QWorld, achievements, AIESEC) and **`src/data/projects.ts`** (project cards and repository links).

- **Resume PDF.** This is `public/Amber-Sahay-Resume.pdf`. To update it, replace the file and keep the same name.
- **Photo (optional).** The About page uses a typographic "AS" monogram. To use a photo instead, replace `.about-portrait` in `src/pages/About.tsx` with an `<img>` that has width, height and alt set.

## Honesty conventions used in the site

- All demos run client-side on **synthetic or representative data**, and each one says so. No language model or backend is connected.
- IPL demo: fictional teams. The routing, metrics and turning-point rules really run (`src/lib/ipl.ts`). The "interpretation" step is a template.
- Guardrail demo: eight regex rules and a code heuristic (`src/lib/guardrail.ts`) stand in for the real engine. Audit hashes are real HMAC-SHA256 computed in the browser with a demo key.
- Guardrail engineering numbers (≈820 tests, 9,000+ fuzz requests, 250–345 rps) are labelled as project-reported.
- The design assistant is labelled as an independent exploratory prototype. It is not an Ather project, and its summary numbers are computed from the page's own state.

## Structure

```
src/
  data/            profile.ts, projects.ts (content) · mock/ (all sample data, clearly separated)
  lib/             pure logic + tests: guardrail.ts, ipl.ts, designAssistant.ts, maddoc.ts, hooks.ts
  components/      Header, Footer (+contact form), motion (decode / stream / count-up / magnetic),
                   ambient (boot loader, cursor, tokens counter, neural field), ModelCard, visuals, sections, case
  demos/           IplDashboard, GuardrailDemo, MaddocShowcase, DesignAssistant
  pages/           one file per route (case studies are lazy-loaded)
  styles/          base (tokens, type), layout, components, demos
```

The demos call pure functions (`ask()`, `inspect()`, `organizeBrief()`, and so on) through a narrow interface. To connect real APIs later, replace those calls with `fetch` to your backend. The UI does not need to change.

### Design system

- Tokens live in `src/styles/base.css` and come in light ("Paper") and dark ("Graphite") themes. The theme toggle is remembered, and on the first visit the site follows `prefers-color-scheme`.
- Fonts: Inter Tight (display/body), Instrument Serif italic (one accent word per heading), JetBrains Mono (system labels).
- Accents: blue `--signal` is the brand colour. Orange `--hot` is used sparingly, for live dots, metrics and high priority.
- Motion respects `prefers-reduced-motion`. With it on, headings and streams show their final text immediately, the canvas is static, and the boot loader is skipped.

I used plain CSS custom properties instead of Tailwind. The SIGNAL spec is token-driven with many bespoke components, so utility classes would have added a dependency without reducing code.

## Deploy

**Netlify (recommended).** The contact form uses Netlify Forms.

1. Push this folder to a GitHub repository.
2. In Netlify, create a new site from that repository. `netlify.toml` already sets the build command (`npm run build`) and the publish directory (`dist`).
3. `public/_headers` applies the CSP and security headers. `public/_redirects` handles SPA routing.
4. Under **Forms**, enable form detection and add an email notification so messages reach your inbox.

**Vercel.** Import the repository. `vercel.json` provides rewrites and headers. The contact form will show its honest fallback message unless you connect a form service such as Formspree in `src/components/Footer.tsx`.

## Tests

`npm test` runs 28 unit tests that cover:

- the guardrail policy engine: detection, Luhn validation, role-based decisions, redaction offsets, and HMAC chaining;
- IPL analytics: totals, phases, collapse detection, routing, and refusing unsupported questions;
- the design assistant: brief parsing, completeness, open questions, feedback priority and category, and summary derivation;
- MaDDoC shared state: verification, booking rules, availability, and schedules across the patient, doctor and admin views.
