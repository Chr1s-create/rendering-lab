import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOCK_API_URL = process.env.MOCK_API_URL ?? "http://localhost:4000";
export const PUBLIC_MOCK_API_URL = process.env.NEXT_PUBLIC_MOCK_API_URL ?? "http://localhost:4000";

export const CLASSIC_URL = process.env.NEXT_PUBLIC_CLASSIC_URL ?? "http://localhost:3000";
export const MODERN_URL = process.env.NEXT_PUBLIC_MODERN_URL ?? "http://localhost:3001";

export function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toISOString().slice(11, 23)}Z`;
}

/** localStorage key that stores quiz results for a lesson. */
export const quizKey = (lessonId: string) => `lab:quiz:${lessonId}`;

export type QuizRecord = Record<string, boolean>;

export function scoreOf(record: QuizRecord) {
  const values = Object.values(record);
  return { correct: values.filter(Boolean).length, answered: values.length };
}
