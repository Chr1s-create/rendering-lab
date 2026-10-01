import type { Lesson } from "../../types";

export const cacheLife: Lesson = {
  id: "cache-life",
  app: "modern",
  href: "/cache-life",
  title: "cacheLife profiles",
  tagline:
    "stale, revalidate, expire. Built-in names (minutes, hours, days, max) or an inline object. This is the modern replacement for export const revalidate = N.",
  notes: {
    what:
      "cacheLife() sets how long a `'use cache'` entry lives. Three numbers: `stale` (how long a client/CDN may use it without checking), `revalidate` (when the server should refresh in the background), `expire` (hard delete — after this the next request must block on a fresh compute). Built-in profiles: default, minutes, hours, days, weeks, max. You can add custom profiles in next.config.ts.",
    where:
      "Called inside a `'use cache'` function on the server. Configured globally in next.config.ts `cacheLife: { lab: { stale, revalidate, expire } }`.",
    when:
      "At cache-entry creation. Changing cacheLife in code affects new entries (and after the old one expires). This is not a per-request header you set later.",
    why:
      "Different data has different freshness. A price might be `minutes`. A legal footer is `max`. Classic ISR only had one number (revalidate) for a whole route. cacheLife is per-function.",
    tradeoffs: [
      "+ Per-function freshness instead of one number for the whole page",
      "+ stale-while-revalidate is explicit",
      "- Three knobs are easier to mis-set than one",
      "- Custom profiles must be listed in next.config.ts to use them by name",
    ],
    mistakes: [
      "Calling cacheLife outside 'use cache' (it does nothing useful / errors)",
      "Using expire shorter than revalidate without understanding that expire is the hard stop",
      "Assuming 'hours' means 'exactly 3600s' without reading the profile table",
      "Leaving the default profile on data that must be fresh (authz, stock)",
    ],
    apis: [
      {
        name: "Built-in",
        snippet: `'use cache'
cacheLife('minutes') // or hours, days, weeks, max, default`,
      },
      {
        name: "Inline",
        snippet: `cacheLife({ stale: 30, revalidate: 60, expire: 300 })`,
      },
      {
        name: "Named custom (next.config.ts)",
        snippet: `cacheLife: { lab: { stale: 5, revalidate: 10, expire: 60 } }
// then: cacheLife('lab')`,
      },
    ],
  },
  tryThis: [
    "Reload /cache-life several times. Each row has its own profile. The 'lab' row (5s stale / 10s revalidate) moves first.",
    "Wait 10+ seconds and reload twice. The lab-profile value should refresh (stale-while-revalidate).",
    "Compare with apps/classic /rendering/isr: one revalidate for the whole route vs per-function cacheLife here.",
    "Open next.config.ts and find the `lab` profile.",
  ],
  verify: [
    {
      label: "Short-lived cache refreshes",
      cmd: `bash scripts/verify-cache-life.sh`,
      expect: "After ~12s the lab-profile upstream hit count increases.",
    },
  ],
  flashcards: [
    { q: "What are stale, revalidate, and expire?", a: "stale: clients may reuse without checking. revalidate: server should refresh in the background after this many seconds. expire: hard TTL — after this the entry is gone." },
    { q: "What is the classic equivalent of cacheLife({ revalidate: 60 })?", a: "export const revalidate = 60 or fetch(..., { next: { revalidate: 60 } })." },
    { q: "Where do named custom profiles live?", a: "next.config.ts cacheLife: { name: { stale, revalidate, expire } }." },
    { q: "Does cacheLife work without 'use cache'?", a: "No. It configures a cache entry created by 'use cache'." },
    { q: "Which profile is closest to 'cache until the next deploy'?", a: "cacheLife('max')." },
  ],
  mcq: [
    {
      id: "cl-1",
      q: "You want background refresh every 60s and a hard stop at 10 minutes. Which call?",
      options: [
        "cacheLife(60)",
        "cacheLife({ revalidate: 60, expire: 600 })",
        "export const revalidate = 60",
        "cacheLife('max')",
      ],
      answer: 1,
      explain: "Inline object. export const revalidate is classic-app only.",
    },
    {
      id: "cl-2",
      q: "After expire, the next request:",
      options: [
        "Always gets stale content",
        "Must compute a fresh value (blocking)",
        "404s",
        "Falls back to CSR",
      ],
      answer: 1,
      explain: "expire is the hard TTL.",
    },
    {
      id: "cl-3",
      q: "This app's `lab` profile is configured as:",
      options: [
        "stale 5, revalidate 10, expire 60",
        "revalidate 3600",
        "max",
        "It isn't — that's a trick",
      ],
      answer: 0,
      explain: "See apps/modern/next.config.ts.",
    },
    {
      id: "cl-4",
      q: "cacheLife('hours') applies to:",
      options: ["The whole route", "That 'use cache' function's entries", "The browser only", "proxy.ts"],
      answer: 1,
      explain: "Per function. That's the upgrade from route-level revalidate.",
    },
    {
      id: "cl-5",
      q: "stale-while-revalidate means:",
      options: [
        "The user waits for a rebuild",
        "A stale entry can be served while a new one is computed in the background",
        "The cache is disabled",
        "Only Edge supports it",
      ],
      answer: 1,
      explain: "Same idea as classic ISR. cacheLife makes the windows explicit.",
    },
  ],
  predict: [
    {
      id: "cl-p1",
      title: "Two functions, two lives",
      code: `async function A() { 'use cache'; cacheLife('max'); return Date.now(); }
async function B() { 'use cache'; cacheLife({ revalidate: 5 }); return Date.now(); }`,
      question: "After 6 seconds, which value can change?",
      answer: "B. A stays until deploy or a tag invalidation.",
      explain: "Per-function lifetimes.",
    },
    {
      id: "cl-p2",
      title: "Missing profile",
      code: `cacheLife('does-not-exist')`,
      question: "What happens?",
      answer: "Build/runtime error unless you defined that name in next.config.ts.",
      explain: "Named profiles are a closed set: built-ins + config.",
    },
  ],
};
