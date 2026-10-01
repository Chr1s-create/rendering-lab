import type { Lesson } from "../../types";

export const caching: Lesson = {
  id: "caching",
  app: "classic",
  href: "/caching",
  title: "The four caching layers",
  tagline:
    "Request Memoization, Data Cache, Full Route Cache, Router Cache. Know where each one lives, how long it lasts, and how to invalidate it, and most 'why is my data stale?' bugs go away.",
  notes: {
    what:
      "1) Request Memoization: during ONE server render, identical GET fetch() calls (and functions wrapped in React cache()) run only once. 2) Data Cache: persistent storage on the server for fetch results (force-cache, next.revalidate, tags) that survives across requests and deploys (on Vercel). 3) Full Route Cache: the stored HTML and RSC payload of static routes. 4) Router Cache: an in-memory cache in the BROWSER of RSC payloads for visited and prefetched route segments.",
    where:
      "Memoization: server memory, scoped to a single request. Data Cache: the server or platform cache (the .next/cache folder locally). Full Route Cache: the server or CDN (.next/server/app/*.html and *.rsc). Router Cache: browser memory (gone on a full reload).",
    when:
      "Memoization lives for the duration of one render pass. The Data Cache lasts until its revalidate time, revalidateTag, or revalidatePath. The Full Route Cache lasts until revalidation or the next deploy. The Router Cache lasts for the session: static segments are reused for about 5 minutes (x-nextjs-stale-time: 300), dynamic ones are refetched on navigation (staleTimes.dynamic = 0), and router.refresh() or a Server Action that revalidates clears it.",
    why:
      "Each layer removes a different cost. Memoization removes duplicate calls inside one render (no more prop-drilling to share data). The Data Cache removes repeated upstream calls. The Full Route Cache removes rendering work. The Router Cache removes network round trips during navigation.",
    tradeoffs: [
      "+ Layers compound. A static route with cached data does zero work per request",
      "+ Fine-grained invalidation with tags, across many routes",
      "- Stacked caches are hard to reason about. A stale value can come from any of the four layers",
      "- The Data Cache is shared by every user, so never cache per-user responses there",
      "- The Router Cache can show stale UI after a mutation unless you revalidate or call router.refresh()",
    ],
    mistakes: [
      "Assuming fetch caches by default. In Next 15+ it doesn't (opt in with force-cache or next.revalidate)",
      "Expecting React cache() to persist across requests. It's per request only. Use the Data Cache or 'use cache' for persistence",
      "Mutating data and only calling revalidateTag(tag, 'max') when the same user needs to see the change right away. That's stale-while-revalidate",
      "Forgetting that POST fetches and fetches with an Authorization header are not cached",
      "Debugging caching in dev mode",
    ],
    apis: [
      {
        name: "Request memoization",
        snippet: `import { cache } from "react";
export const getUser = cache(async (id: string) => db.user.find(id)); // dedupe within one render
// fetch() GET with the same URL and options is memoized automatically`,
      },
      {
        name: "Data Cache",
        snippet: `fetch(url, { cache: "force-cache" });                    // cache indefinitely
fetch(url, { next: { revalidate: 60, tags: ["posts"] } }); // time + tag
revalidateTag("posts", "max");                            // invalidate by tag`,
      },
      {
        name: "Full Route Cache",
        snippet: `revalidatePath("/blog");          // re-render that route on the next request
revalidatePath("/blog/[slug]", "page");`,
      },
      {
        name: "Router Cache",
        snippet: `"use client";
const router = useRouter();
router.refresh();   // refetch the current route's RSC payload from the server

// next.config.ts: experimental: { staleTimes: { dynamic: 30, static: 180 } }`,
      },
    ],
  },
  tryThis: [
    "On /caching, look at section 1. Three components each call getStats(): without cache() the body ran 3 times, with cache() it ran once. The three identical fetches only cost 1 upstream hit.",
    "Reload /caching. The page timestamp changes (it's dynamic), the no-store fetch counter goes up, but the force-cache fetch keeps the same servedAt. That is the Data Cache serving a dynamic page.",
    "Click 'revalidateTag(data-cache-demo)' and reload. The force-cache value updates once and then sticks again.",
    "Open /caching/full-route. It's static, so its timestamp is frozen. Click revalidatePath and the timestamp updates.",
    "Go to /caching/router. Click between the 'static' and 'dynamic' pages with <Link>. The navigation log shows that the dynamic page gets a new server timestamp on every visit, while the static one is reused. Then do a hard reload to clear the Router Cache.",
  ],
  verify: [
    {
      label: "Memoization + Data Cache",
      cmd: `bash scripts/verify-caching.sh`,
      expect: "Per request, the memo-fetch hits go up by 1 (not 3). Across requests, the force-cache servedAt stays the same while the no-store servedAt changes.",
    },
    {
      label: "Where the caches live on disk",
      cmd: `ls apps/classic/.next/cache/fetch-cache | head; ls apps/classic/.next/server/app/caching/`,
      expect: "fetch-cache entries (the Data Cache) and full-route.html / full-route.rsc (the Full Route Cache).",
    },
  ],
  flashcards: [
    {
      q: "Name the four caching layers and where each lives.",
      a: "Request Memoization (server, per request). Data Cache (server/platform, persistent). Full Route Cache (server/CDN, HTML + RSC payload). Router Cache (browser memory).",
    },
    {
      q: "What's the difference between React cache() and the Data Cache?",
      a: "cache() dedupes calls within a single server request and is discarded afterwards. The Data Cache persists fetch results across requests and users until they're revalidated.",
    },
    {
      q: "A dynamic page uses fetch with force-cache. Does the page re-render per request? Is the data refetched?",
      a: "The page re-renders on every request (it's dynamic), but the fetch is served from the Data Cache, so the upstream isn't called again.",
    },
    {
      q: "How do you bust the Router Cache after a mutation?",
      a: "Call revalidatePath or revalidateTag inside a Server Action (Next sends the fresh payload back), or call router.refresh() on the client. A hard reload also clears it.",
    },
    {
      q: "Which fetches are never stored in the Data Cache?",
      a: "Those with cache: 'no-store' or next.revalidate: 0, non-GET methods like POST, and, by default since Next 15, fetches with no cache option at all.",
    },
    {
      q: "What does x-nextjs-stale-time: 300 mean?",
      a: "It tells the client Router Cache how long, in seconds, it may reuse this prefetched or visited static segment before refetching.",
    },
  ],
  mcq: [
    {
      id: "ca-1",
      q: "Three Server Components in one render each call fetch('https://api/user/1'). How many network requests?",
      options: ["3", "1, because of request memoization", "0", "Depends on the Router Cache"],
      answer: 1,
      explain: "Identical GET fetches in the same render pass are memoized.",
    },
    {
      id: "ca-2",
      q: "You use an ORM (not fetch) to load the current user in a layout and in a page. How do you avoid two queries?",
      options: ["fetch cache: 'force-cache'", "Wrap the loader in React cache()", "useMemo", "revalidate = 60"],
      answer: 1,
      explain: "cache() gives non-fetch functions the same per-request dedupe.",
    },
    {
      id: "ca-3",
      q: "Which layer is in the browser?",
      options: ["Data Cache", "Full Route Cache", "Router Cache", "Request Memoization"],
      answer: 2,
      explain: "The Router Cache stores RSC payloads in memory for instant back/forward and prefetched navigation.",
    },
    {
      id: "ca-4",
      q: "After a Server Action updates a post, the user navigates back to the list and still sees the old title. Most likely cause?",
      options: [
        "The Data Cache never expires",
        "The action didn't call revalidatePath or revalidateTag, so the Router Cache and route caches still hold the old payload",
        "The fetch had no-store",
        "Streaming",
      ],
      answer: 1,
      explain: "Revalidating inside the action purges the server caches AND tells the client router to drop stale entries.",
    },
    {
      id: "ca-5",
      q: "Is it safe to cache GET /api/me (per-user) with force-cache?",
      options: ["Yes", "No. The Data Cache is shared across all users, so you'd leak data between them", "Only with tags", "Only on Edge"],
      answer: 1,
      explain: "Per-user data must not go into a shared cache. Fetches with an Authorization header are not cached automatically, but don't rely on that.",
    },
  ],
  predict: [
    {
      id: "ca-p1",
      title: "Dynamic page, cached data",
      code: `export default async function P() {
  await connection();
  const a = await fetch(API + "/time?tag=a", { cache: "force-cache" }).then(r => r.json());
  const b = await fetch(API + "/time?tag=b", { cache: "no-store" }).then(r => r.json());
  return <p>{a.servedAt} / {b.servedAt}</p>;
}`,
      question: "Reload 3 times. Which values change?",
      answer: "a.servedAt stays the same. b.servedAt changes every reload.",
      explain: "The route renders per request, but 'a' comes from the Data Cache and 'b' goes upstream each time.",
    },
    {
      id: "ca-p2",
      title: "cache() across requests",
      code: `const getConfig = cache(async () => { console.log("load"); return loadConfig(); });
// called in layout and page`,
      question: "Over 5 requests to a dynamic page, how many times is 'load' printed?",
      answer: "5, once per request.",
      explain: "React cache() is scoped to a single request. For cross-request caching use the Data Cache or 'use cache'.",
    },
  ],
};
