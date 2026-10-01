import type { Lesson } from "../../types";

export const runtimeData: Lesson = {
  id: "runtime-data",
  app: "modern",
  href: "/runtime-data",
  title: "Runtime data, private cache, connection()",
  tagline:
    "cookies(), headers(), and searchParams are request-time. They cannot live inside a normal 'use cache'. Pass them in as arguments, use 'use cache: private', or stay dynamic behind Suspense.",
  notes: {
    what:
      "Runtime data is anything that is different per request: cookies, headers, search params, connection() (a primitive that says 'I am dynamic'). Cache Components refuse to let that data sneak into a prerendered or shared cache entry. The allowed patterns: (1) read it in a dynamic Server Component inside Suspense, (2) read it outside and pass the value into a `'use cache'` function (the value becomes part of the key), (3) `'use cache: private'` when you must cache per-user and still touch cookies inside.",
    where:
      "All of these APIs run on the server. The result may be sent to the client as HTML. `'use cache: private'` is not a shared CDN cache — it is a per-user cache.",
    when:
      "Every request for dynamic / private. For 'pass as argument', the cached function runs once per distinct argument (e.g. once per theme cookie value).",
    why:
      "This is the rule that keeps personalised data out of the shared Full Route Cache. If you cache a page that called cookies() without isolating it, user A's HTML could be served to user B.",
    tradeoffs: [
      "+ The compiler forces you to choose: shared cache, private cache, or stream",
      "+ Passing a cookie value in as an argument gives you a shared cache keyed by that value (good for theme=dark)",
      "- 'use cache: private' is easier to misuse for data that should never be cached",
      "- connection() is easy to sprinkle everywhere and accidentally de-optimize",
    ],
    mistakes: [
      "Calling cookies() inside 'use cache' (error). Extract, then pass.",
      "Passing the whole cookies() store (non-serializable / too wide key)",
      "Using connection() 'just in case' on a page that could have been cached",
      "Caching per-user secrets in a shared 'use cache' because you forgot the cookie was an argument visible in logs",
    ],
    apis: [
      {
        name: "Pass as argument (preferred)",
        snippet: `export default async function Page() {
  const theme = (await cookies()).get("theme")?.value ?? "dark";
  return <CachedPanel theme={theme} />;
}
async function CachedPanel({ theme }: { theme: string }) {
  'use cache'
  cacheLife('hours')
  return <p>theme={theme}</p>; // key includes theme
}`,
      },
      {
        name: "connection() — explicit dynamic",
        snippet: `async function FreshId() {
  await connection();          // defer to request time
  return <p>{crypto.randomUUID()}</p>;
}`,
      },
      {
        name: "Private cache",
        snippet: `async function Inbox() {
  'use cache: private'
  const id = (await cookies()).get("user")?.value;
  return getInbox(id);
}`,
      },
    ],
  },
  tryThis: [
    "Set the theme cookie with the buttons. The cached panel's argument changes, so you get a different cache entry — not a leak of the other theme.",
    "Reload: the UUID from connection() changes every time; the cached panel does not.",
    "Open the private-cache demo: it reads a cookie inside 'use cache: private'.",
    "Read the commented-out illegal snippet in the Notes tab and imagine the build error.",
  ],
  verify: [
    {
      label: "Dynamic UUID changes",
      cmd: `bash scripts/verify-runtime-data.sh`,
      expect: "Two curls show different data-marker=runtime-uuid values. The cached theme panel stays stable for the same cookie.",
    },
  ],
  flashcards: [
    { q: "How do you cache something that depends on a cookie?", a: "Read the cookie outside. Pass the value into a 'use cache' function so it becomes part of the key. Or use 'use cache: private'." },
    { q: "What does connection() do?", a: "It opts the surrounding server code into request time. Use it for Date.now()/random that must differ per request, outside of 'use cache'." },
    { q: "Why can't cookies() live in a shared 'use cache'?", a: "The result would be stored as if it were public. User B could receive user A's cached HTML." },
    { q: "Is 'use cache: private' a CDN cache?", a: "No. It's a per-user cache for compliance / request-scoped reuse, and it may use runtime APIs inside." },
    { q: "searchParams in the modern app?", a: "Request-time. Read them in a dynamic component inside Suspense, or pass specific values into cached functions." },
  ],
  mcq: [
    {
      id: "rd-1",
      q: "This code is inside 'use cache': `const t = (await cookies()).get('theme')`. Result?",
      options: ["Works, keyed by theme", "Error (unless 'use cache: private')", "Silently ignored", "Becomes CSR"],
      answer: 1,
      explain: "Extract outside or use private.",
    },
    {
      id: "rd-2",
      q: "Best way to cache a dark/light wrapper used by everyone with that theme?",
      options: [
        "'use cache: private' always",
        "Read cookie outside, pass theme string into 'use cache'",
        "Don't cache",
        "Put cookies() in the root layout with no Suspense",
      ],
      answer: 1,
      explain: "Two shared entries: theme=dark and theme=light.",
    },
    {
      id: "rd-3",
      q: "Date.now() inside 'use cache' returns:",
      options: [
        "A new value every request",
        "The time the cache entry was created",
        "Browser time",
        "undefined",
      ],
      answer: 1,
      explain: "Use connection() outside cache for per-request time.",
    },
    {
      id: "rd-4",
      q: "connection() must be:",
      options: [
        "Inside 'use cache'",
        "Outside 'use cache', typically inside a Suspense hole",
        "In a Client Component",
        "In next.config.ts",
      ],
      answer: 1,
      explain: "It marks the region dynamic. In Cache Components that region needs Suspense.",
    },
    {
      id: "rd-5",
      q: "If the root layout calls cookies() with no Suspense under cacheComponents:",
      options: ["Every page becomes a PPR hole at the root — or the build fails", "Only the layout is dynamic and pages stay fully static", "Nothing", "It becomes Edge"],
      answer: 0,
      explain: "Don't personalise the root layout without a boundary. You'll lose the static shell.",
    },
  ],
  predict: [
    {
      id: "rd-p1",
      title: "Pass the cookie",
      code: `const theme = (await cookies()).get('theme')?.value ?? 'dark';
return <Cached theme={theme} />; // Cached has 'use cache'`,
      question: "How many cache entries for 100 users, half dark / half light?",
      answer: "Two (plus whatever else is in the key).",
      explain: "The argument is the theme string, not the user id.",
    },
    {
      id: "rd-p2",
      title: "Random without connection",
      code: `export default function Page() {
  return <p>{crypto.randomUUID()}</p>;
}`,
      question: "cacheComponents on. Is this per-request?",
      answer: "No — it's prerendered into the static shell (one UUID at build). Use connection() in a Suspense hole.",
      explain: "Non-deterministic values in static regions freeze at build.",
    },
  ],
};
