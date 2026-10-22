import { describe, expect, it } from "vitest";
import { ask, cumulative, phaseStats, totals, turningPoints, UnsupportedQuestion } from "./ipl";
import { MATCH } from "../data/mock/ipl";

const [indigo, saffron] = MATCH.innings;

describe("deterministic analytics", () => {
  it("computes innings totals", () => {
    expect(totals(indigo)).toEqual({ runs: 186, wickets: 6 });
    expect(totals(saffron)).toEqual({ runs: 168, wickets: 8 });
    expect(cumulative(indigo).at(-1)).toBe(186);
  });

  it("splits phases that add up to the total", () => {
    const p = phaseStats(indigo);
    expect(p.map((x) => x.phase)).toEqual(["Powerplay", "Middle", "Death"]);
    expect(p.reduce((s, x) => s + x.runs, 0)).toBe(186);
    expect(p[0].runs).toBe(57);
  });

  it("detects the chase collapse as a turning point", () => {
    const tp = turningPoints(saffron);
    const collapse = tp.find((t) => t.kind === "collapse");
    expect(collapse?.over).toBe(9);
    expect(collapse?.text).toBe("3 wickets for 12 runs in overs 7–9");
    expect(tp.filter((t) => t.kind === "big-over").map((t) => t.over)).toEqual([3, 18]);
  });
});

describe("question routing", () => {
  it("routes to validated tools", () => {
    expect(ask("Who was the top scorer?").intent).toBe("batting_leaderboard");
    expect(ask("Which bowler was most economical?").intent).toBe("bowling_leaderboard");
    expect(ask("How did the death overs compare?").intent).toBe("phase_breakdown");
    expect(ask("Where did the chase turn?").intent).toBe("match_turning_points");
  });

  it("narratives only restate computed numbers", () => {
    expect(ask("top scorer").narrative).toContain("68 off 44");
    expect(ask("death overs").narrative).toContain("14-run advantage");
  });

  it("refuses instead of guessing", () => {
    expect(() => ask("What is the weather at the ground?")).toThrow(UnsupportedQuestion);
    expect(() => ask("hi")).toThrow(UnsupportedQuestion);
  });
});
