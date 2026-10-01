import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MultipleChoiceQuiz } from "./multiple-choice";

const questions = [
  {
    id: "q1",
    q: "What is SSG?",
    options: ["Per request", "Build time", "Browser only"],
    answer: 1,
    explain: "Static generation runs at build.",
  },
];

describe("MultipleChoiceQuiz", () => {
  it("scores a correct answer and persists the explanation", async () => {
    const user = userEvent.setup();
    render(<MultipleChoiceQuiz lessonId="test-ssg" questions={questions} />);
    expect(screen.getByTestId("mcq-score")).toHaveTextContent("score 0/1");
    await user.click(screen.getByRole("button", { name: "Build time" }));
    expect(screen.getByTestId("mcq-explain")).toHaveTextContent("Correct");
    expect(screen.getByTestId("mcq-score")).toHaveTextContent("score 1/1");
  });
});
