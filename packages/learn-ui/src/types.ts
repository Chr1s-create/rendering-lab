export type AppId = "classic" | "modern";

export interface Flashcard {
  q: string;
  a: string;
}

export interface MultipleChoice {
  id: string;
  q: string;
  options: string[];
  /** index into options */
  answer: number;
  explain: string;
}

export interface PredictOutput {
  id: string;
  title: string;
  code: string;
  question: string;
  answer: string;
  explain: string;
}

export interface VerifyStep {
  label: string;
  cmd: string;
  expect: string;
}

export interface LessonNotes {
  /** One-paragraph definition. */
  what: string;
  /** Where the code runs: server, client, CDN, build machine. */
  where: string;
  /** When it runs: build, request, revalidation, hydration, navigation. */
  when: string;
  /** Why/when you would pick it. */
  why: string;
  tradeoffs: string[];
  mistakes: string[];
  /** Short key APIs / snippets. */
  apis: { name: string; snippet: string }[];
}

export interface Lesson {
  id: string;
  app: AppId;
  href: string;
  title: string;
  tagline: string;
  notes: LessonNotes;
  tryThis: string[];
  verify: VerifyStep[];
  flashcards: Flashcard[];
  mcq: MultipleChoice[];
  predict: PredictOutput[];
}
