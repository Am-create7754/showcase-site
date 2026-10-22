import { describe, expect, it } from "vitest";
import {
  briefCompleteness,
  organizeBrief,
  organizeFeedback,
  priorityOf,
  splitItems,
  summarize,
  type Brief,
  type WorkflowState,
} from "./designAssistant";
import { SAMPLE_BRIEF, SAMPLE_FEEDBACK } from "../data/mock/design";

const empty: Brief = { projectName: "", category: "", targetUser: "", goals: "", constraints: "", references: "" };

describe("brief organisation", () => {
  it("splits lists, bullets and sentences", () => {
    expect(splitItems("- one thing\n- two thing; three thing")).toEqual(["one thing", "two thing", "three thing"]);
  });

  it("computes completeness from filled fields", () => {
    expect(briefCompleteness(empty)).toBe(0);
    expect(briefCompleteness({ ...empty, projectName: "Kestrel", category: "Scooter", goals: "Calm" })).toBe(50);
    expect(briefCompleteness(SAMPLE_BRIEF)).toBe(100);
  });

  it("turns the sample brief into structured requirements", () => {
    const o = organizeBrief(SAMPLE_BRIEF);
    expect(o.coreGoals.length).toBeGreaterThan(2);
    expect(o.constraints.length).toBeGreaterThan(2);
    expect(o.userNeeds.length).toBeGreaterThan(0);
    expect(o.criteria.length).toBeGreaterThan(0);
    // questions are raised only for topics the brief doesn't mention
    expect(o.openQuestions.some((q) => /cost bracket/.test(q))).toBe(true);
  });

  it("does not ask about topics the brief already covers", () => {
    const o = organizeBrief({ ...SAMPLE_BRIEF, constraints: "Budget under target cost" });
    expect(o.openQuestions.some((q) => /cost bracket/.test(q))).toBe(false);
  });
});

describe("feedback to actions", () => {
  it("assigns priorities from wording", () => {
    expect(priorityOf("Must improve accessibility")).toBe("High");
    expect(priorityOf("Maybe explore a warmer grey")).toBe("Low");
    expect(priorityOf("Compare the two seat profiles")).toBe("Medium");
  });

  it("categorises and sorts high priority first", () => {
    const tasks = organizeFeedback(SAMPLE_FEEDBACK);
    expect(tasks.length).toBe(SAMPLE_FEEDBACK.trim().split("\n").length);
    expect(tasks[0].priority).toBe("High");
    expect(tasks.some((t) => t.category === "Durability")).toBe(true);
    expect(tasks.some((t) => t.category === "CMF")).toBe(true);
  });
});

describe("workflow summary", () => {
  it("is derived only from local state", () => {
    const base: WorkflowState = { brief: empty, organized: null, resolvedQuestions: [], shortlisted: [], cmfSelection: null, tasks: [] };
    const s0 = summarize(base);
    expect(s0.completeness).toBe(0);
    expect(s0.openTasks).toBe(0);
    expect(s0.nextSteps[0]).toMatch(/Complete the brief/);

    const organized = organizeBrief(SAMPLE_BRIEF);
    const tasks = organizeFeedback(SAMPLE_FEEDBACK).map((t) => ({ ...t, done: true }));
    const s1 = summarize({
      brief: SAMPLE_BRIEF,
      organized,
      resolvedQuestions: organized.openQuestions,
      shortlisted: ["a"],
      cmfSelection: "x",
      tasks,
    });
    expect(s1.completeness).toBe(100);
    expect(s1.outstandingQuestions).toBe(0);
    expect(s1.openTasks).toBe(0);
    expect(s1.doneTasks).toBe(tasks.length);
    expect(s1.nextSteps).toEqual(["Everything is captured — prepare material for the next design review"]);
  });
});
