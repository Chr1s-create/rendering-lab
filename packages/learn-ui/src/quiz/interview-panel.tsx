"use client";

import type { Lesson } from "../types";
import { Flashcards } from "./flashcards";
import { MultipleChoiceQuiz } from "./multiple-choice";
import { PredictOutputCards } from "./predict-output";

export function InterviewPanel({ lesson }: { lesson: Pick<Lesson, "id" | "flashcards" | "mcq" | "predict"> }) {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 text-lg font-semibold">Flashcards</h3>
        <Flashcards cards={lesson.flashcards} />
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">Multiple choice (scored)</h3>
        <MultipleChoiceQuiz lessonId={lesson.id} questions={lesson.mcq} />
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">Predict the output</h3>
        <PredictOutputCards lessonId={lesson.id} items={lesson.predict} />
      </section>
    </div>
  );
}
