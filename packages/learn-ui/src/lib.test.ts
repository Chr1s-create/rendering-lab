import { describe, expect, it } from "vitest";
import { quizKey, scoreOf } from "./lib";

describe("scoreOf", () => {
  it("counts correct and answered", () => {
    expect(scoreOf({ a: true, b: false, c: true })).toEqual({ correct: 2, answered: 3 });
  });
  it("handles an empty record", () => {
    expect(scoreOf({})).toEqual({ correct: 0, answered: 0 });
  });
});

describe("quizKey", () => {
  it("namespaces by lesson", () => {
    expect(quizKey("ssg")).toBe("lab:quiz:ssg");
  });
});
