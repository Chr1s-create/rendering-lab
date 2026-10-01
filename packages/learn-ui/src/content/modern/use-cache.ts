import type { Lesson } from "../../types";

export const useCache: Lesson = {
  id: "use-cache",
  app: "modern",
  href: "/use-cache",
  title: "'use cache' levels and cache keys",
  tagline:
    "A directive, not a wrapper. Put it on a file, a component, or a function. The cache key is automatic: function identity + arguments + closed-over values.",
  notes: {
    what:
      "`'use cache'` tells Next to persist the result of a Server Component or async function. It replaces `unstable_cache()` and, together with cacheLife, replaces `export const revalidate`. The same function with the same arguments returns the stored result until the entry goes stale or a tag is invalidated.",
    where:
      "On the server only. It cannot decorate a Client Component. The cached output is sent to the client as HTML/RSC, not as a memoized browser function.",
    when:
      "First call (often at build, if the page can prerender) computes and stores. Later calls reuse. After cacheLife.revalidate, the next request can refresh in the background. updateTag expires immediately.",
    why:
      "You want a product list shared by every user, computed at most once per minute, without making the whole route dynamic. Or you want to cache an expensive function used from several components.",
    tradeoffs: [
      "+ No manual cache keys (less drift than unstable_cache keyParts)",
      "+ Works at function granularity, so a page can mix cached and dynamic",
      "- Arguments and closures MUST be serializable — they become the key",
      "- Easy to accidentally close over a changing value and fragment the cache",
      "- Cannot call cookies()/headers() inside unless you use 'use cache: private'",
    ],
    mistakes: [
      "Closing over Date.now() or a request object — the key changes every time, so you never hit",
      "Passing a whole object whose identity changes (new object each render) as an argument",
      "Putting 'use cache' on a Client Component",
      "Expecting cache() from React to persist across requests — that's request memoization only",
    ],
    apis: [
      {
        name: "Three levels",
        snippet: `// file: 'use cache' at the top caches every export
'use cache'
export async function Page() { ... }

// component
async function CachedPosts() { 'use cache'; ... }

// function
async function getPosts() { 'use cache'; cacheTag('posts'); return db.posts(); }`,
      },
      {
        name: "Key = args + closures",
        snippet: `async function getUser(id: string) {
  'use cache'
  return db.user(id); // id is part of the key automatically
}`,
      },
    ],
  },
  tryThis: [
    "Reload /use-cache. The function-level and component-level timestamps stay put; hit counters do not move.",
    "Change the user id with the links. Each id is a different cache entry (key includes the argument).",
    "Compare the two user ids: visiting A then B then A does not increment A's upstream hits.",
    "Read the 'closed-over value' demo: the note explains why a non-serializable / changing closure is a footgun.",
  ],
  verify: [
    {
      label: "Cached function is not recalled",
      cmd: `bash scripts/verify-use-cache.sh`,
      expect: "Two reloads do not increment tag=use-cache-fn hits.",
    },
  ],
  flashcards: [
    {
      q: "What goes into a 'use cache' key?",
      a: "Build id, function identity, serializable arguments, and serializable closed-over values.",
    },
    {
      q: "Can 'use cache' call cookies()?",
      a: "Not in the default mode. Extract cookies() outside and pass the value in, or use 'use cache: private'.",
    },
    {
      q: "What did 'use cache' replace?",
      a: "unstable_cache(), and together with cacheLife it replaces export const revalidate / force-static in this model.",
    },
    {
      q: "Does React cache() do the same thing?",
      a: "No. React cache() is per-request memoization. 'use cache' persists across requests.",
    },
    {
      q: "File-level vs function-level — when do you pick function-level?",
      a: "When only part of the module should be cached, or when you want to pass arguments that become keys.",
    },
  ],
  mcq: [
    {
      id: "uc-1",
      q: "Two calls to getUser('42') in different requests, both 'use cache'. Upstream hits?",
      options: ["2", "1 (same key)", "0", "Depends on cookies"],
      answer: 1,
      explain: "Same function, same argument → same cache entry.",
    },
    {
      id: "uc-2",
      q: "You close over `const now = Date.now()` from the page (dynamic) into a 'use cache' function. What happens?",
      options: [
        "It caches forever with the first now",
        "The closure is part of the key, so you may never reuse an entry — or the build complains",
        "Date.now is stripped",
        "It becomes a Client Component",
      ],
      answer: 1,
      explain: "Changing closures bust the key. Pass stable arguments instead.",
    },
    {
      id: "uc-3",
      q: "Where is 'use cache' illegal?",
      options: ["Async Server Component", "Async server function", "Client Component", "A helper imported by a Server Component"],
      answer: 2,
      explain: "It is a server cache. Client Components cannot use it.",
    },
    {
      id: "uc-4",
      q: "unstable_cache(fn, ['user', id], { tags: ['users'], revalidate: 60 }) becomes:",
      options: [
        "cache(fn)",
        "async function get(id) { 'use cache'; cacheTag('users'); cacheLife({ revalidate: 60 }); return fn(id); }",
        "export const revalidate = 60",
        "fetch(url, { next: { revalidate: 60 } }) only",
      ],
      answer: 1,
      explain: "No manual keyParts. id is the argument. Tags and life move inside the function.",
    },
    {
      id: "uc-5",
      q: "Is the default 'use cache' lifetime infinite?",
      options: [
        "Yes, until deploy",
        "No — default profile is about 5 minutes stale / 15 minutes revalidate unless you call cacheLife",
        "It lasts one request",
        "It lasts one session",
      ],
      answer: 1,
      explain: "Always set cacheLife when the freshness matters.",
    },
  ],
  predict: [
    {
      id: "uc-p1",
      title: "Argument as key",
      code: `async function price(id: string) { 'use cache'; return db.price(id); }
await price('a'); await price('b'); await price('a');`,
      question: "How many db.price calls if the cache is cold, then warm?",
      answer: "2 when cold (a and b). The third call hits the cache for a.",
      explain: "Each distinct argument is an entry.",
    },
    {
      id: "uc-p2",
      title: "Client file",
      code: `'use client'
export async function Cached() { 'use cache'; return 'x'; }`,
      question: "Valid?",
      answer: "No. 'use cache' is server-only and cannot live in a Client Component module.",
      explain: "Directives don't mix that way.",
    },
  ],
};
