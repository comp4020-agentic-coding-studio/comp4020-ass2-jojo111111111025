import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface ApiNode {
  id: string;
  type: string;
  meta?: Record<string, unknown>;
}

interface CourseApi {
  nodes: ApiNode[];
}

const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as CourseApi;

describe("curriculum", () => {
  it("runs across all twelve dated teaching weeks", () => {
    const dated = api.nodes.filter((node) => ["sessions", "lectures"].includes(node.type));
    const weeksCovered = new Set(dated.map((node) => Number(node.meta?.week)));
    const missing = Array.from({ length: 12 }, (_, i) => i + 1).filter(
      (week) => !weeksCovered.has(week),
    );
    expect(missing, `weeks with no session or lecture: ${missing.join(", ")}`).toEqual([]);
  });

  it("has at least one lecture with a real deck linked from its page", () => {
    const lectures = api.nodes.filter((node) => node.type === "lectures");
    const withSlides = lectures.filter((node) =>
      /^\/decks\/[a-z0-9-]+\/$/.test(String(node.meta?.slides ?? "")),
    );
    expect(withSlides.length, "no lecture has a slides: link to a deck").toBeGreaterThan(0);
  });

  it("weights its assessments to add up to 100%", () => {
    const assessments = api.nodes.filter((node) => node.type === "assessments");
    const total = assessments.reduce((sum, node) => sum + Number(node.meta?.weight ?? 0), 0);
    expect(total, `assessment weights sum to ${total}, not 100`).toBe(100);
  });

  it("every episode states its question and links to its neighbours", () => {
    const lectures = api.nodes.filter((node) => node.type === "lectures");
    const problems: string[] = [];
    for (const lecture of lectures) {
      const week = Number(lecture.meta?.week);
      if (!lecture.meta?.psychologicalQuestion) {
        problems.push(`${lecture.id}: missing psychologicalQuestion`);
      }
      if (week !== 1 && !lecture.meta?.previouslyOn) {
        problems.push(`${lecture.id}: missing previouslyOn`);
      }
      if (week !== 12 && !lecture.meta?.nextTease) {
        problems.push(`${lecture.id}: missing nextTease`);
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
});
