// Deterministic analytics + question routing for the IPL Intelligence DEMO.
// Mirrors the project's principle: code computes, the language layer only explains.
// In this demo the "interpretation" step is a template, not a model.

import { BATTING, BOWLING, MATCH, type Innings } from "../data/mock/ipl";

export type Phase = "Powerplay" | "Middle" | "Death";
export const PHASES: { phase: Phase; from: number; to: number }[] = [
  { phase: "Powerplay", from: 0, to: 6 },
  { phase: "Middle", from: 6, to: 15 },
  { phase: "Death", from: 15, to: 20 },
];

const sum = (a: number[]) => a.reduce((s, n) => s + n, 0);

export function totals(inn: Innings) {
  return { runs: sum(inn.runsPerOver), wickets: sum(inn.wicketsPerOver) };
}

export function cumulative(inn: Innings): number[] {
  let t = 0;
  return inn.runsPerOver.map((r) => (t += r));
}

export function phaseStats(inn: Innings) {
  return PHASES.map(({ phase, from, to }) => {
    const runs = sum(inn.runsPerOver.slice(from, to));
    const wickets = sum(inn.wicketsPerOver.slice(from, to));
    return { phase, runs, wickets, runRate: +(runs / (to - from)).toFixed(2) };
  });
}

export interface TurningPoint {
  over: number; // 1-based over where the event ends
  team: string;
  kind: "collapse" | "big-over" | "partnership";
  text: string;
}

/** Collapse = 3+ wickets inside a 3-over window. Big over = 13+ runs. Partnership = 5+ overs without a wicket. */
export function turningPoints(inn: Innings): TurningPoint[] {
  const out: TurningPoint[] = [];
  const { runsPerOver: r, wicketsPerOver: w } = inn;
  for (let i = 0; i + 3 <= w.length; i++) {
    const wk = sum(w.slice(i, i + 3));
    if (wk >= 3 && !out.some((p) => p.kind === "collapse" && p.over > i)) {
      out.push({ over: i + 3, team: inn.short, kind: "collapse", text: `${wk} wickets for ${sum(r.slice(i, i + 3))} runs in overs ${i + 1}–${i + 3}` });
    }
  }
  r.forEach((runs, i) => {
    if (runs >= 13) out.push({ over: i + 1, team: inn.short, kind: "big-over", text: `${runs}-run over (over ${i + 1})` });
  });
  let start = 0;
  for (let i = 0; i <= w.length; i++) {
    if (i === w.length || w[i] > 0) {
      if (i - start >= 5) {
        out.push({ over: i, team: inn.short, kind: "partnership", text: `${sum(r.slice(start, i))} runs across overs ${start + 1}–${i} without losing a wicket` });
      }
      start = i + 1;
    }
  }
  return out.sort((a, b) => a.over - b.over);
}

export interface Answer {
  intent: string;
  tool: string;
  params: string;
  rows: { label: string; value: string }[];
  narrative: string;
}

const ROUTES: { test: RegExp; run: () => Answer }[] = [
  {
    test: /top scorer|most runs|best bat|highest score|batter|batting/i,
    run: () => {
      const top = [...BATTING].sort((a, b) => b.runs - a.runs);
      const b = top[0];
      const sr = ((b.runs / b.balls) * 100).toFixed(1);
      return {
        intent: "batting_leaderboard",
        tool: "batting.leaderboard(match, sort=runs)",
        params: `match="${MATCH.title}", limit=3`,
        rows: top.slice(0, 3).map((x) => ({ label: `${x.name} (${x.team})`, value: `${x.runs} off ${x.balls}` })),
        narrative: `${b.name} top-scored with ${b.runs} off ${b.balls} balls (strike rate ${sr}), including ${b.sixes} sixes.`,
      };
    },
  },
  {
    test: /econom|best bowl|bowler|bowling|wickets/i,
    run: () => {
      const eco = [...BOWLING].map((x) => ({ ...x, economy: x.runs / x.overs })).sort((a, b) => a.economy - b.economy);
      const b = eco[0];
      return {
        intent: "bowling_leaderboard",
        tool: "bowling.leaderboard(match, sort=economy)",
        params: `match="${MATCH.title}", min_overs=2`,
        rows: eco.slice(0, 3).map((x) => ({ label: `${x.name} (${x.team})`, value: `${x.wickets}/${x.runs} · econ ${x.economy.toFixed(2)}` })),
        narrative: `${b.name} was the most economical bowler: ${b.wickets} for ${b.runs} in ${b.overs} overs, an economy of ${b.economy.toFixed(2)}.`,
      };
    },
  },
  {
    test: /death|powerplay|middle overs|phase/i,
    run: () => {
      const [a, s] = MATCH.innings.map(phaseStats);
      const death = (p: ReturnType<typeof phaseStats>) => p.find((x) => x.phase === "Death")!;
      const da = death(a), ds = death(s);
      const diff = da.runs - ds.runs;
      return {
        intent: "phase_breakdown",
        tool: "phases.compare(match, phases=[PP, middle, death])",
        params: `match="${MATCH.title}"`,
        rows: PHASES.map((p, i) => ({ label: p.phase, value: `IND ${a[i].runs} · SAF ${s[i].runs}` })),
        narrative: `In the death overs Team Indigo scored ${da.runs} (run rate ${da.runRate}) against Team Saffron's ${ds.runs} (${ds.runRate}) — a ${Math.abs(diff)}-run ${diff >= 0 ? "advantage" : "deficit"} for Indigo in the last five overs.`,
      };
    },
  },
  {
    test: /turn|why|collapse|momentum|lose|lost|win|won|swing/i,
    run: () => {
      const tp = turningPoints(MATCH.innings[1]);
      const collapse = tp.find((p) => p.kind === "collapse");
      const [ti, ts] = MATCH.innings.map(totals);
      return {
        intent: "match_turning_points",
        tool: "match_intelligence.turning_points(match, innings=2)",
        params: `match="${MATCH.title}", rules=[collapse, big_over, partnership]`,
        rows: tp.map((p) => ({ label: `Over ${p.over}`, value: p.text })),
        narrative: collapse
          ? `Chasing ${ti.runs + 1}, Team Saffron were ahead after the powerplay, then lost ${collapse.text}. They finished on ${ts.runs}/${ts.wickets}, ${ti.runs - ts.runs} runs short.`
          : `No collapse was detected; Team Saffron finished on ${ts.runs}/${ts.wickets}.`,
      };
    },
  },
];

export class UnsupportedQuestion extends Error {}

/** Deterministic-first routing: match a validated tool, or refuse rather than guess. */
export function ask(question: string): Answer {
  const q = question.trim();
  if (q.length < 4) throw new UnsupportedQuestion("Ask a full question — for example, “Who was the top scorer?”");
  const route = ROUTES.find((r) => r.test.test(q));
  if (!route) {
    throw new UnsupportedQuestion(
      "No validated tool in this demo matches that question. The real agent would say it can't answer rather than invent a statistic.",
    );
  }
  return route.run();
}
