import type { Lesson } from "../../types";

export const migration: Lesson = {
  id: "migration",
  app: "modern",
  href: "/migration",
  title: "Classic → modern mapping",
  tagline:
    "A cheat sheet from export const revalidate, dynamic, unstable_cache, and fetch next.revalidate to Cache Components.",
  notes: {
    what:
      "Next 16 did not delete the classic APIs — it added a second programming model. When cacheComponents is true, route segment config (`dynamic`, `revalidate`) is off the table. You express the same intent with `'use cache'`, cacheLife, cacheTag, Suspense, and connection().",
    where:
      "Config lives in next.config.ts (cacheComponents, cacheLife profiles). Caching intent lives next to the data, inside functions, instead of at the top of page.tsx.",
    when:
      "Migrate a route when you need a static shell plus dynamic holes (PPR), or when you're already on Next 16 and want the compiler to catch uncached data leaks. Stay on the classic model for a route if you need Edge, or if the team still thinks in getStaticProps / revalidate = N.",
    why:
      "Interviews will ask you to translate. Production teams will mix both: this repo is the map.",
    tradeoffs: [
      "+ Modern model: finer granularity, build-time safety, PPR",
      "+ Classic model: familiar, works with Edge, matches years of blog posts",
      "- You cannot flip cacheComponents on a single route (it's app-wide), so this lab uses two apps",
      "- Docs and Stack Overflow still show the classic APIs first",
    ],
    mistakes: [
      "Enabling cacheComponents and leaving export const dynamic = 'force-dynamic' (invalid)",
      "Translating getServerSideProps to 'use cache' (that's the opposite)",
      "Forgetting Suspense around the dynamic leftover after you cache the rest",
      "Using single-arg revalidateTag after migrating",
    ],
    apis: [
      {
        name: "Mapping table (memorise this)",
        snippet: `classic                              modern
─────────────────────────────────────────────────────────
experimental.ppr                     cacheComponents: true
export const revalidate = N          cacheLife({ revalidate: N })
export const dynamic = 'force-static''use cache' + cacheLife('max')
export const dynamic = 'force-dynamic'  (default) + Suspense
unstable_cache(fn, keys, opts)       'use cache' + cacheTag + cacheLife
fetch next.revalidate / tags         still valid, or move into 'use cache'
cookies() in a page                  cookies() inside <Suspense>
connection()                         connection() inside <Suspense>
revalidateTag(tag)                   revalidateTag(tag, 'max')
revalidatePath(path)                 revalidatePath(path)  (same)
generateStaticParams                 generateStaticParams  (same)`,
      },
    ],
  },
  tryThis: [
    "Read the table on this page, then open the matching classic page in a second tab.",
    "For each classic trigger on /rendering/ssr/triggers/*, say out loud what the modern version is.",
    "Quiz yourself on the Interview tab until you can fill the table from memory.",
  ],
  verify: [
    {
      label: "Both apps respond",
      cmd: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/rendering/isr && echo && curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/migration`,
      expect: "200 and 200. Classic ISR and modern mapping page both up.",
    },
  ],
  flashcards: [
    { q: "export const revalidate = 60 becomes?", a: "'use cache' + cacheLife({ revalidate: 60 }) on the data function (or a built-in profile)." },
    { q: "export const dynamic = 'force-static' becomes?", a: "'use cache' + cacheLife('max'). cookies()/headers() must be passed in as args or they return empty/error." },
    { q: "export const dynamic = 'force-dynamic' becomes?", a: "The default. Dynamic reads go in Suspense. No flag needed." },
    { q: "unstable_cache becomes?", a: "An async function with 'use cache', cacheTag() instead of options.tags, cacheLife() instead of options.revalidate. No keyParts array." },
    { q: "getServerSideProps becomes?", a: "An async Server Component that reads request data (classic) or that same component inside Suspense (modern). Never 'use cache'." },
    { q: "getStaticPaths becomes?", a: "generateStaticParams in both models." },
  ],
  mcq: [
    {
      id: "mig-1",
      q: "You have fetch(url, { next: { revalidate: 10, tags: ['posts'] } }) in classic. A faithful modern version is:",
      options: [
        "Leave it, but also add export const revalidate = 10",
        "async function get() { 'use cache'; cacheLife({ revalidate: 10 }); cacheTag('posts'); return fetch(url).then(r=>r.json()); }",
        "getServerSideProps",
        "useEffect",
      ],
      answer: 1,
      explain: "Move the cache intent onto the function.",
    },
    {
      id: "mig-2",
      q: "A classic page uses cookies() and is fully dynamic. In modern, to keep the header static you:",
      options: [
        "Keep cookies() in the page body",
        "Move cookies() into a child wrapped in Suspense; cache or statically render the header",
        "Switch to getServerSideProps",
        "Set runtime = 'edge'",
      ],
      answer: 1,
      explain: "That's PPR.",
    },
    {
      id: "mig-3",
      q: "cacheHandler (singular) in next.config is:",
      options: ["Required", "Deprecated — use cacheHandlers (plural) with per-type handlers", "A React hook", "Pages Router only"],
      answer: 1,
      explain: "Next 16 rename.",
    },
    {
      id: "mig-4",
      q: "Which classic API still exists unchanged in the modern app?",
      options: ["export const revalidate", "export const dynamic", "revalidatePath()", "experimental.ppr"],
      answer: 2,
      explain: "Invalidation functions remain. Segment config does not.",
    },
    {
      id: "mig-5",
      q: "You should NOT enable cacheComponents when:",
      options: [
        "You want PPR",
        "You need Edge runtime or static export for this app",
        "You use Server Actions",
        "You use generateStaticParams",
      ],
      answer: 1,
      explain: "Cache Components require Node and a server.",
    },
  ],
  predict: [
    {
      id: "mig-p1",
      title: "Translate this page",
      code: `export const revalidate = 10;
export default async function Page() {
  const data = await fetch(API + '/time?tag=isr').then(r => r.json());
  return <p>{data.servedAt}</p>;
}`,
      question: "Write the modern equivalent in one sentence.",
      answer: "An async function with 'use cache' + cacheLife({ revalidate: 10 }) (and optionally cacheTag) that fetches /time; the page renders <Cached />.",
      explain: "See /cache-life and the side-by-side on this page.",
    },
    {
      id: "mig-p2",
      title: "Translate SSR",
      code: `export default async function Page() {
  const name = (await cookies()).get('lab-name')?.value;
  return <p>{name}</p>;
}`,
      question: "What must change under cacheComponents?",
      answer: "Wrap the cookies() read in a component inside <Suspense>, or the build fails. The rest of the page can stay static.",
      explain: "Classic: the whole route was dynamic. Modern: only the hole is.",
    },
  ],
};
