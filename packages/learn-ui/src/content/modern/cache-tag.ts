import type { Lesson } from "../../types";

export const cacheTagLesson: Lesson = {
  id: "cache-tag",
  app: "modern",
  href: "/cache-tag",
  title: "cacheTag: updateTag vs revalidateTag",
  tagline:
    "Tag a cached function, then invalidate it from a Server Action. updateTag is read-your-writes. revalidateTag is background / stale-while-revalidate.",
  notes: {
    what:
      "cacheTag('name') marks the current `'use cache'` entry. Later, a Server Action can call `updateTag('name')` (expire now — the rest of this request and the next read see fresh data) or `revalidateTag('name', profile)` (mark stale, refresh in the background). This is how a 'publish' button updates a cached list.",
    where:
      "cacheTag runs inside the cached function on the server. updateTag / revalidateTag run in Server Actions or Route Handlers on the server. The browser only submits the form.",
    when:
      "After a mutation. If the user who just saved must see their change immediately, use updateTag. If a slightly stale list is fine (a public blog index), use revalidateTag.",
    why:
      "Without tags you can only wait for cacheLife or redeploy. Tags let one write invalidate many cached functions (list + detail + sitemap) that opted in.",
    tradeoffs: [
      "+ One write can refresh every function that tagged itself",
      "+ updateTag gives read-your-writes in the same request",
      "- Forgotten tags = stale UI after a mutation (the #1 cache bug)",
      "- revalidateTag(tag) single-arg is deprecated; pass a profile as the second arg",
    ],
    mistakes: [
      "Calling revalidateTag(tag) with one argument in Next 16 (deprecated)",
      "Using revalidateTag when the same page must show the new row immediately — the user still sees stale",
      "Tagging nothing, then wondering why updateTag did nothing",
      "Putting cacheTag outside 'use cache'",
    ],
    apis: [
      {
        name: "Tag + two invalidators",
        snippet: `async function list() {
  'use cache'
  cacheTag('todos-modern')
  return getTodos();
}

// Server Action:
updateTag('todos-modern')                 // expire now, same request sees fresh
revalidateTag('todos-modern', 'max')      // stale-while-revalidate`,
      },
    ],
  },
  tryThis: [
    "Note the cached list timestamp. Click 'add + updateTag'. The new todo appears immediately and the timestamp moves.",
    "Reload once more — still there (cache was rebuilt).",
    "Click 'add + revalidateTag'. Depending on timing you may still see the old list for one request, then the new one.",
    "Watch mock-api /todos hits: they jump only when the cache is actually recomputed.",
  ],
  verify: [
    {
      label: "updateTag refreshes the list",
      cmd: `bash scripts/verify-cache-tag.sh`,
      expect: "A POST-like action via the page (or the verify script's curl to a helper) results in a new cached payload.",
    },
  ],
  flashcards: [
    { q: "When do you pick updateTag over revalidateTag?", a: "When the same user / same request must read the new data (read-your-writes). Forms that stay on the page after save." },
    { q: "When do you pick revalidateTag?", a: "When serving stale briefly is fine: public indexes, ISR-like lists, webhooks from a CMS." },
    { q: "Where must cacheTag() be called?", a: "Inside the 'use cache' function whose entry you want to mark." },
    { q: "What is the Next 16 signature for revalidateTag?", a: "revalidateTag(tag, cacheLifeProfile) e.g. revalidateTag('posts', 'max')." },
    { q: "Can one tag invalidate multiple functions?", a: "Yes. Every 'use cache' function that called cacheTag('posts') is invalidated together." },
  ],
  mcq: [
    {
      id: "ct-1",
      q: "User submits a form and the action calls revalidateTag('todos', 'max'). The action then renders the list from 'use cache'. The user sees:",
      options: [
        "Always the new todo",
        "Possibly the old list (SWR). Use updateTag if they must see the new todo now",
        "An error",
        "A client-only list",
      ],
      answer: 1,
      explain: "revalidateTag is background. updateTag expires immediately.",
    },
    {
      id: "ct-2",
      q: "revalidateTag('posts') with one argument in Next 16 is:",
      options: ["Required", "Deprecated — pass a profile as the second argument", "A Client hook", "The same as updateTag"],
      answer: 1,
      explain: "The lab uses revalidateTag(tag, 'max').",
    },
    {
      id: "ct-3",
      q: "cacheTag('a', 'b') means:",
      options: [
        "The entry has both tags; invalidating either busts it",
        "Only the first tag counts",
        "It creates two cache copies",
        "It's illegal",
      ],
      answer: 0,
      explain: "Detail pages often tag both 'products' and `product-${id}`.",
    },
    {
      id: "ct-4",
      q: "Who calls updateTag?",
      options: ["A Client Component directly", "A Server Action or Route Handler", "proxy.ts only", "The browser's fetch cache"],
      answer: 1,
      explain: "It's a server cache API.",
    },
    {
      id: "ct-5",
      q: "Classic App Router equivalent of cacheTag + revalidateTag?",
      options: [
        "There isn't one",
        "fetch next.tags + revalidateTag / revalidatePath",
        "getStaticPaths",
        "useOptimistic",
      ],
      answer: 1,
      explain: "Same idea, different place the tag is declared.",
    },
  ],
  predict: [
    {
      id: "ct-p1",
      title: "Read-your-writes",
      code: `async function add() {
  'use server'
  await db.insert(...)
  updateTag('todos-modern')
}`,
      question: "After the action, the cached list on the same page shows the new row?",
      answer: "Yes. updateTag expired the entry before the follow-up render.",
      explain: "This is why the demo has two buttons.",
    },
    {
      id: "ct-p2",
      title: "Forgot to tag",
      code: `async function list() { 'use cache'; return db.all(); }
updateTag('todos-modern')`,
      question: "Does the list refresh?",
      answer: "No. The function never called cacheTag('todos-modern').",
      explain: "Invalidation is opt-in per entry.",
    },
  ],
};
