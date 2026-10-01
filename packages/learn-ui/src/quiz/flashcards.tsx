"use client";

import { useState } from "react";
import type { Flashcard } from "../types";
import { Button, Card } from "../ui/primitives";

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setRevealed(new Set(cards.map((_, i) => i)))}>
          reveal all
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRevealed(new Set())}>
          hide all
        </Button>
      </div>
      {cards.map((c, i) => (
        <Card key={c.q} className="p-3">
          <button
            type="button"
            className="w-full cursor-pointer text-left text-sm font-medium"
            onClick={() => toggle(i)}
            aria-expanded={revealed.has(i)}
          >
            <span className="mr-2 text-zinc-500">Q{i + 1}.</span>
            {c.q}
          </button>
          {revealed.has(i) ? (
            <p className="mt-2 border-t border-zinc-800 pt-2 text-sm whitespace-pre-line text-zinc-300" data-testid="flashcard-answer">
              {c.a}
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">Answer out loud first, then click to reveal.</p>
          )}
        </Card>
      ))}
    </div>
  );
}
