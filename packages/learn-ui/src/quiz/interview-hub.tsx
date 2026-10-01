"use client";

import { useEffect, useMemo, useState } from "react";
import { cn, scoreOf } from "../lib";
import type { Lesson } from "../types";
import { Badge, Button, Card } from "../ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Flashcards } from "./flashcards";
import { MultipleChoiceQuiz } from "./multiple-choice";
import { readRecord } from "./use-quiz-record";

type HubLesson = Pick<Lesson, "id" | "title" | "app" | "href" | "flashcards" | "mcq" | "predict">;

const WEAK_THRESHOLD = 0.7;

function shuffle<T>(arr: T[], seed: number) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function InterviewHub({ lessons, originNote }: { lessons: HubLesson[]; originNote?: string }) {
  const [tick, setTick] = useState(0);
  const [seed, setSeed] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setTick((t) => t + 1);
    window.addEventListener("lab:quiz-updated", sync);
    window.addEventListener("storage", sync);
    sync();
    return () => {
      window.removeEventListener("lab:quiz-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const rows = useMemo(() => {
    if (tick === 0) return lessons.map((l) => ({ lesson: l, correct: 0, answered: 0, total: l.mcq.length }));
    return lessons.map((l) => {
      const rec = readRecord(l.id);
      const mcqOnly = Object.fromEntries(Object.entries(rec).filter(([k]) => l.mcq.some((q) => q.id === k)));
      return { lesson: l, ...scoreOf(mcqOnly), total: l.mcq.length };
    });
  }, [lessons, tick]);

  const weak = rows.filter((r) => r.answered < r.total || r.correct / r.total < WEAK_THRESHOLD);
  const totals = rows.reduce((acc, r) => ({ c: acc.c + r.correct, t: acc.t + r.total }), { c: 0, t: 0 });
  const allCards = useMemo(
    () => shuffle(lessons.flatMap((l) => l.flashcards.map((c) => ({ ...c, q: `[${l.title}] ${c.q}` }))), seed),
    [lessons, seed],
  );

  return (
    <Tabs defaultValue="scores">
      <TabsList>
        <TabsTrigger value="scores">Scoreboard</TabsTrigger>
        <TabsTrigger value="weak">Weak topics ({weak.length})</TabsTrigger>
        <TabsTrigger value="drill">Flashcard drill ({allCards.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="scores" className="space-y-3">
        <p className="text-sm text-zinc-400">
          Overall: <strong className="text-zinc-100">{totals.c}/{totals.t}</strong> multiple-choice correct.{" "}
          {originNote}
        </p>
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left text-xs text-zinc-400">
              <tr>
                <th className="p-2">Topic</th>
                <th className="p-2">App</th>
                <th className="p-2">Score</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = r.total ? r.correct / r.total : 0;
                return (
                  <tr key={r.lesson.id} className="border-t border-zinc-800">
                    <td className="p-2">{r.lesson.title}</td>
                    <td className="p-2">
                      <Badge tone="neutral">{r.lesson.app}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded bg-zinc-800">
                          <div
                            className={cn("h-full", pct >= WEAK_THRESHOLD ? "bg-emerald-500" : "bg-amber-500")}
                            style={{ width: `${pct * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">
                          {r.correct}/{r.total}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(r.lesson.id)}>
                        practice
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {selected && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{lessons.find((l) => l.id === selected)?.title}</h3>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                close
              </Button>
            </div>
            <MultipleChoiceQuiz lessonId={selected} questions={lessons.find((l) => l.id === selected)?.mcq ?? []} />
          </Card>
        )}
      </TabsContent>

      <TabsContent value="weak" className="space-y-6">
        <p className="text-sm text-zinc-400">
          Topics with unanswered questions or a score below {WEAK_THRESHOLD * 100}%.
        </p>
        {weak.length === 0 && <p className="text-emerald-400">No weak topics. Try the flashcard drill.</p>}
        {weak.map((r) => (
          <section key={r.lesson.id}>
            <h3 className="mb-2 font-semibold">
              {r.lesson.title}{" "}
              <span className="font-mono text-xs text-zinc-500">
                {r.correct}/{r.total}
              </span>
            </h3>
            <MultipleChoiceQuiz lessonId={r.lesson.id} questions={r.lesson.mcq} />
          </section>
        ))}
      </TabsContent>

      <TabsContent value="drill" className="space-y-3">
        <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>
          shuffle
        </Button>
        <Flashcards key={seed} cards={allCards} />
      </TabsContent>
    </Tabs>
  );
}
