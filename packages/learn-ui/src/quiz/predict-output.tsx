"use client";

import { useState } from "react";
import type { PredictOutput } from "../types";
import { Button, Card, CodeBlock } from "../ui/primitives";
import { useQuizRecord } from "./use-quiz-record";

export function PredictOutputCards({ lessonId, items }: { lessonId: string; items: PredictOutput[] }) {
  const { record, save } = useQuizRecord(lessonId);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [guesses, setGuesses] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      {items.map((p) => {
        const key = `predict:${p.id}`;
        const open = revealed.has(p.id);
        return (
          <Card key={p.id} className="space-y-2 p-3">
            <p className="text-sm font-semibold">{p.title}</p>
            <CodeBlock code={p.code} />
            <p className="text-sm">{p.question}</p>
            <textarea
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 text-sm"
              rows={2}
              placeholder="Write your prediction before revealing..."
              value={guesses[p.id] ?? ""}
              onChange={(e) => setGuesses((g) => ({ ...g, [p.id]: e.target.value }))}
            />
            {!open ? (
              <Button size="sm" variant="outline" onClick={() => setRevealed((s) => new Set(s).add(p.id))}>
                reveal answer
              </Button>
            ) : (
              <div className="space-y-2 border-t border-zinc-800 pt-2 text-sm">
                <p>
                  <strong>Answer:</strong> {p.answer}
                </p>
                <p className="text-zinc-400 whitespace-pre-line">{p.explain}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Self-grade:</span>
                  <Button size="sm" variant={record[key] === true ? "default" : "outline"} onClick={() => save(key, true)}>
                    I got it
                  </Button>
                  <Button size="sm" variant={record[key] === false ? "destructive" : "outline"} onClick={() => save(key, false)}>
                    I missed it
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
