"use client";

import { useCallback, useEffect, useState } from "react";
import { quizKey, type QuizRecord } from "../lib";

const EVENT = "lab:quiz-updated";

export function readRecord(lessonId: string): QuizRecord {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(quizKey(lessonId)) ?? "{}");
  } catch {
    return {};
  }
}

/** Quiz results persisted in localStorage (per origin, so :3000 and :3001 are separate). */
export function useQuizRecord(lessonId: string) {
  const [record, setRecord] = useState<QuizRecord>({});

  useEffect(() => {
    setRecord(readRecord(lessonId));
    const sync = () => setRecord(readRecord(lessonId));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [lessonId]);

  const save = useCallback(
    (questionId: string, correct: boolean) => {
      const next = { ...readRecord(lessonId), [questionId]: correct };
      window.localStorage.setItem(quizKey(lessonId), JSON.stringify(next));
      setRecord(next);
      window.dispatchEvent(new Event(EVENT));
    },
    [lessonId],
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(quizKey(lessonId));
    setRecord({});
    window.dispatchEvent(new Event(EVENT));
  }, [lessonId]);

  return { record, save, reset };
}
