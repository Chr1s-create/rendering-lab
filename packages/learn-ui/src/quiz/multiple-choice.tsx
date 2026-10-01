"use client";

import { useState } from "react";
import { cn, scoreOf } from "../lib";
import type { MultipleChoice } from "../types";
import { Badge, Button, Card } from "../ui/primitives";
import { useQuizRecord } from "./use-quiz-record";

export function MultipleChoiceQuiz({ lessonId, questions }: { lessonId: string; questions: MultipleChoice[] }) {
  const { record, save, reset } = useQuizRecord(lessonId);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const mcqRecord = Object.fromEntries(
    Object.entries(record).filter(([k]) => questions.some((q) => q.id === k)),
  );
  const { correct, answered } = scoreOf(mcqRecord);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Badge tone={answered && correct === answered ? "good" : "neutral"} data-testid="mcq-score">
          score {correct}/{questions.length}
          {answered < questions.length ? ` (${answered} answered)` : ""}
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            reset();
            setPicked({});
          }}
        >
          reset lesson score
        </Button>
      </div>
      {questions.map((q, qi) => {
        const choice = picked[q.id];
        const done = choice !== undefined;
        return (
          <Card key={q.id} className="p-3" data-testid={`mcq-${q.id}`}>
            <p className="text-sm font-medium whitespace-pre-line">
              <span className="mr-2 text-zinc-500">{qi + 1}.</span>
              {q.q}
            </p>
            <div className="mt-2 grid gap-1.5">
              {q.options.map((opt, oi) => (
                <button
                  key={opt}
                  type="button"
                  disabled={done}
                  onClick={() => {
                    setPicked((p) => ({ ...p, [q.id]: oi }));
                    save(q.id, oi === q.answer);
                  }}
                  className={cn(
                    "cursor-pointer rounded-md border px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-default",
                    !done && "border-zinc-700 hover:bg-zinc-800",
                    done && oi === q.answer && "border-emerald-600 bg-emerald-950 text-emerald-200",
                    done && oi === choice && oi !== q.answer && "border-red-600 bg-red-950 text-red-200",
                    done && oi !== choice && oi !== q.answer && "border-zinc-800 text-zinc-500",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {done && (
              <p className="mt-2 text-sm text-zinc-300" data-testid="mcq-explain">
                <strong>{choice === q.answer ? "Correct. " : "Not quite. "}</strong>
                {q.explain}
              </p>
            )}
            {!done && record[q.id] !== undefined && (
              <p className="mt-2 text-xs text-zinc-500">
                Previously answered {record[q.id] ? "correctly" : "incorrectly"}. Answer again to update.
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
