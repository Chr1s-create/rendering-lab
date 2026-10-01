import { describe, expect, it } from "vitest";
import { allLessons, classicLessons, modernLessons } from "./index";

describe("lesson content contract", () => {
  it("exports classic and modern lessons", () => {
    expect(classicLessons.length).toBeGreaterThanOrEqual(11);
    expect(modernLessons.length).toBeGreaterThanOrEqual(6);
    expect(allLessons).toHaveLength(classicLessons.length + modernLessons.length);
  });

  it.each(allLessons.map((l) => [l.id, l] as const))("%s has notes, verify steps, and enough practice", (_id, lesson) => {
    expect(lesson.notes.what.length).toBeGreaterThan(40);
    expect(lesson.notes.where.length).toBeGreaterThan(20);
    expect(lesson.notes.when.length).toBeGreaterThan(20);
    expect(lesson.notes.why.length).toBeGreaterThan(20);
    expect(lesson.notes.tradeoffs.length).toBeGreaterThanOrEqual(2);
    expect(lesson.notes.mistakes.length).toBeGreaterThanOrEqual(2);
    expect(lesson.tryThis.length).toBeGreaterThanOrEqual(3);
    expect(lesson.verify.length).toBeGreaterThanOrEqual(1);
    expect(lesson.flashcards.length).toBeGreaterThanOrEqual(5);
    expect(lesson.mcq.length).toBeGreaterThanOrEqual(5);
    expect(lesson.predict.length).toBeGreaterThanOrEqual(1);
    const ids = lesson.mcq.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
