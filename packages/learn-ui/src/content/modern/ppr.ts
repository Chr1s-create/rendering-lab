import type { Lesson } from "../../types";

export const ppr: Lesson = {
  id: "ppr",
  app: "modern",
  href: "/ppr",
  title: "Partial Prerendering (Cache Components)",
  tagline:
    "One route, three kinds of content: static shell, cached data, and dynamic holes that stream in. The CDN can serve the shell instantly.",
  notes: {
    what:
      "Partial Prerendering (PPR) is what Cache Components enable. At build time Next produces a static shell: everything that is synchronous or wrapped in `'use cache'`. Holes marked by <Suspense> are filled at request time with fresh dynamic data. The user sees the shell immediately; the dynamic parts stream in.",
    where:
      "The shell is prerendered on the BUILD machine and can live on a CDN. Cached functions run on the server when their cache is cold. Dynamic holes run on the server per request. Client Components inside any of those still hydrate in the browser.",
    when:
      "Build: static + cached output is stored. Request: the shell is served immediately; Suspense fallbacks are in that shell; dynamic content streams as it resolves. Revalidate: cached parts refresh according to cacheLife.",
    why:
      "Most pages are a mix: a marketing header (static), a product list (cached for minutes), a cart badge (per user). PPR lets you keep the static speed without making the whole route dynamic — which is what cookies() would do in the classic model.",
    tradeoffs: [
      "+ Static TTFB even on pages with personalised bits",
      "+ Forces you to declare cached vs dynamic (build fails if you forget)",
      "- You cannot use export const revalidate / dynamic in this app",
      "- Edge runtime and static export are not supported with Cache Components",
      "- Requires wrapping every dynamic read in Suspense or 'use cache'",
    ],
    mistakes: [
      "Calling cookies()/headers()/connection() in the page body without a Suspense boundary — build error: uncached data outside Suspense",
      "Putting the whole page in 'use cache' and then wondering why the user name is stale or the build failed",
      "Testing PPR only in next dev (the shell vs stream split is a production/build behavior)",
      "Confusing the Suspense fallback (in the shell) with the streamed content (request time)",
    ],
    apis: [
      {
        name: "Enable",
        snippet: `// next.config.ts
const nextConfig = { cacheComponents: true };`,
      },
      {
        name: "Three kinds",
        snippet: `export default function Page() {
  return (
    <>
      <h1>Static</h1>
      <Cached />                         {/* 'use cache' */}
      <Suspense fallback={<p>…</p>}>
        <PerUser />                      {/* cookies(), connection(), no-store */}
      </Suspense>
    </>
  );
}`,
      },
    ],
  },
  tryThis: [
    "View-source /ppr. The static title and the cached timestamp are in the HTML. The dynamic hole may show the fallback.",
    "Reload quickly. The cached section's timestamp stays. The dynamic section's timestamp moves.",
    "Watch the mock-api hit counters: ppr-cached should barely move; ppr-dynamic increments per reload.",
    "Run `pnpm --filter modern build` and look for the ◐ Partial Prerender symbol on /ppr.",
    "Temporarily call connection() in the page body (outside Suspense) and rebuild — read the error.",
  ],
  verify: [
    {
      label: "Shell is in the HTML",
      cmd: `curl -s http://localhost:3001/ppr | grep -E 'data-marker="ppr-static"|data-marker="ppr-cached"'`,
      expect: "Both markers appear. The static and cached parts were prerendered into the shell.",
    },
    {
      label: "Dynamic hits move, cached hits do not",
      cmd: `bash scripts/verify-ppr.sh`,
      expect: "Two reloads increment tag=ppr-dynamic, not tag=ppr-cached.",
    },
  ],
  flashcards: [
    {
      q: "What are the three content types under cacheComponents?",
      a: "Static (sync, prerendered), cached ('use cache'), and dynamic (request-time, must be inside Suspense).",
    },
    {
      q: "What happens if you read cookies() in a page with no Suspense and no 'use cache'?",
      a: "next build fails: uncached data was accessed outside of <Suspense>.",
    },
    {
      q: "Is the Suspense fallback in the prerendered shell?",
      a: "Yes. The fallback HTML is part of the static shell. The resolved content streams later.",
    },
    {
      q: "How do you recognise PPR in the build output?",
      a: "The ◐ symbol (partial prerender) on that route.",
    },
    {
      q: "Why is PPR better than making the whole page dynamic for a cart badge?",
      a: "The header, nav, and cached catalog stay CDN-fast. Only the badge is request-time.",
    },
  ],
  mcq: [
    {
      id: "ppr-1",
      q: "cacheComponents is on. A page is a sync header plus <Suspense><User /></Suspense> that calls cookies(). The route is:",
      options: ["Fully dynamic (ƒ)", "Fully static (○)", "Partially prerendered (◐)", "CSR"],
      answer: 2,
      explain: "The header is in the shell. User streams. That is PPR.",
    },
    {
      id: "ppr-2",
      q: "What replaced experimental.ppr in Next 16?",
      options: ["export const ppr = true", "cacheComponents: true", "runtime = 'edge'", "dynamic = 'force-static'"],
      answer: 1,
      explain: "The config flag is now cacheComponents.",
    },
    {
      id: "ppr-3",
      q: "Which piece is NOT in the prerendered shell?",
      options: [
        "Synchronous JSX",
        "A 'use cache' component's last result",
        "The Suspense fallback",
        "The resolved children of a Suspense that reads cookies()",
      ],
      answer: 3,
      explain: "Resolved dynamic children are request-time. The fallback is in the shell.",
    },
    {
      id: "ppr-4",
      q: "Can this modern app use export const revalidate = 60?",
      options: [
        "Yes, same as classic",
        "No — Cache Components disable route segment config; use cacheLife instead",
        "Only on Server Actions",
        "Only in proxy.ts",
      ],
      answer: 1,
      explain: "That is why this lab is two apps.",
    },
    {
      id: "ppr-5",
      q: "Non-deterministic Date.now() inside 'use cache' runs:",
      options: [
        "Every request",
        "Once, when the cache entry is created (build or revalidate)",
        "In the browser",
        "Never; it throws",
      ],
      answer: 1,
      explain: "Cached functions freeze their output. Use connection() outside cache for per-request randomness.",
    },
  ],
  predict: [
    {
      id: "ppr-p1",
      title: "Uncached outside Suspense",
      code: `export default async function Page() {
  const t = Date.now(); // plus await cookies()
  return <p>{t}</p>;
}`,
      question: "cacheComponents is true. What does next build do?",
      answer: "Fail. Uncached/request data must be inside Suspense or 'use cache'.",
      explain: "This is the defining constraint of the modern model.",
    },
    {
      id: "ppr-p2",
      title: "Reload the PPR page",
      code: `<>
  <Cached />           {/* use cache, cacheLife hours */}
  <Suspense><Fresh /></Suspense>  {/* connection() + no-store */}
</>`,
      question: "Which timestamp changes on every reload?",
      answer: "Only Fresh. Cached stays until its cacheLife expires or a tag is invalidated.",
      explain: "That split is the whole point of PPR.",
    },
  ],
};
