import type { Lesson } from "../../types";

export const isr: Lesson = {
  id: "isr",
  app: "classic",
  href: "/rendering/isr",
  title: "ISR: Incremental Static Regeneration",
  tagline:
    "Static pages that refresh themselves. Visitors get cached HTML, and after the revalidate window (or an on-demand trigger), Next rebuilds the page in the background.",
  notes: {
    what:
      "ISR is SSG plus a timer or a trigger. The page is prerendered and cached like SSG. With `export const revalidate = N`, the cached version is considered fresh for N seconds. After that, the next request still gets the old (STALE) page, while Next regenerates it in the background. The request after that gets the new page. This is stale-while-revalidate. On-demand ISR (revalidatePath or revalidateTag) marks cached pages and data stale immediately, for example from a CMS webhook.",
    where:
      "Regeneration runs on the server in the background, triggered by a real request. Nothing happens until someone visits. The cached HTML is served from the server cache or the CDN. revalidatePath and revalidateTag run on the server, in Server Actions or Route Handlers.",
    when:
      "Build time first, then at most once per revalidate window, and only when traffic arrives. On-demand: right after you call revalidatePath or revalidateTag, the next request triggers the rebuild.",
    why:
      "Content that is the same for everyone but changes: product listings, blogs fed by a CMS, leaderboards. You get SSG speed with bounded staleness, and you don't need to rebuild the whole site.",
    tradeoffs: [
      "+ Static performance, with data that stays fresh within N seconds",
      "+ On-demand revalidation gives near-instant updates without a redeploy",
      "- The first visitor after expiry still sees stale content (by design)",
      "- Regeneration still costs server work, and a failed regeneration keeps serving the last good page",
      "- Not suitable for per-user data (it's shared cache)",
    ],
    mistakes: [
      "Expecting the page to update exactly at N seconds. It updates on the first request AFTER N seconds, and that request still receives the stale version",
      "Mixing a route `revalidate = 60` with a fetch revalidate of 10. The lowest value wins for the route",
      "Calling revalidateTag(tag) with one argument in Next 16. It's deprecated. Pass a profile: revalidateTag(tag, 'max')",
      "Not protecting a revalidate webhook endpoint with a secret",
      "Testing in dev mode, where there is no ISR",
    ],
    apis: [
      {
        name: "Time-based (route level)",
        snippet: `export const revalidate = 10; // seconds; the HTML is regenerated at most every 10s`,
      },
      {
        name: "Time-based / tagged (data level)",
        snippet: `await fetch(url, { next: { revalidate: 10, tags: ["isr-time"] } });`,
      },
      {
        name: "On-demand (Server Action / Route Handler)",
        snippet: `"use server";
import { revalidatePath, revalidateTag } from "next/cache";

revalidatePath("/rendering/isr");          // purge the cached route
revalidateTag("isr-time", "max");          // stale-while-revalidate by tag (Next 16 signature)
revalidateTag("isr-time", { expire: 0 });  // expire immediately`,
      },
    ],
  },
  tryThis: [
    "Open /rendering/isr in production. Note the timestamp, then reload repeatedly for 10s. It doesn't change, and the header shows x-nextjs-cache: HIT.",
    "Wait more than 10s and reload ONCE. You get the OLD timestamp, but the header says STALE. Reload again: there's a new timestamp. That's stale-while-revalidate.",
    "Click 'Run ISR probe'. It requests the page every second for 15s and charts HIT/STALE and the timestamp, so you see the cycle without reloading.",
    "Click 'revalidatePath' and then reload. Fresh HTML comes back immediately, without waiting 10s.",
    "Trigger the webhook with curl (see Verify) to simulate a CMS publish event.",
  ],
  verify: [
    {
      label: "Full ISR cycle (about 15s)",
      cmd: `bash scripts/verify-isr.sh`,
      expect: "HIT with the same timestamp, then after 11s STALE with the old timestamp, then HIT with a new timestamp.",
    },
    {
      label: "On-demand via webhook",
      cmd: `curl -s -X POST 'localhost:3000/api/revalidate?tag=isr-time' -H 'x-lab-secret: lab'
curl -s localhost:3000/rendering/isr >/dev/null   # triggers background regen
curl -s localhost:3000/rendering/isr | grep -o 'data-ts="[^"]*"' | head -1`,
      expect: "{\"revalidated\":true,...}, then a new timestamp on the second or third request.",
    },
    {
      label: "Cache-Control",
      cmd: `curl -sI localhost:3000/rendering/isr | grep -i cache-control`,
      expect: "s-maxage=10, stale-while-revalidate=... so CDNs can follow the same revalidation window.",
    },
  ],
  flashcards: [
    {
      q: "Explain stale-while-revalidate in ISR in one sentence.",
      a: "After the revalidate window expires, the next request is served the stale cached page immediately while Next regenerates the page in the background, and the following requests get the fresh page.",
    },
    {
      q: "Does ISR regenerate on a timer even with no traffic?",
      a: "No. Regeneration is triggered by a request after the window has expired. With no visitors, nothing runs.",
    },
    {
      q: "revalidatePath vs revalidateTag?",
      a: "revalidatePath invalidates a specific route's cached output. revalidateTag invalidates every cached fetch or 'use cache' entry tagged with that tag, which can affect many routes at once.",
    },
    {
      q: "What happens if regeneration throws an error?",
      a: "Next keeps serving the last successfully generated page and retries on a later request. Users don't see the error.",
    },
    {
      q: "Route revalidate = 60 but a fetch has next.revalidate = 10. What's the effective route revalidation?",
      a: "10 seconds. The lowest revalidate in the route's tree determines how often the route is regenerated.",
    },
    {
      q: "Next 16 change to revalidateTag?",
      a: "It takes a second argument, a cacheLife profile such as 'max' or { expire: 0 }. The single-argument form is deprecated. For read-your-own-writes inside a Server Action, use updateTag(tag).",
    },
  ],
  mcq: [
    {
      id: "isr-1",
      q: "revalidate = 10. The page was generated at t=0. A user visits at t=25. What does that user see?",
      options: [
        "A page freshly generated at t=25",
        "The page from t=0 (stale), while a regeneration starts in the background",
        "A loading spinner",
        "A 504 while it regenerates",
      ],
      answer: 1,
      explain: "Stale-while-revalidate: the first request after expiry receives the stale page and triggers the regeneration.",
    },
    {
      id: "isr-2",
      q: "A CMS editor publishes a post and wants it live within a second. Best approach?",
      options: [
        "Set revalidate = 1 on every page",
        "Have a CMS webhook call a Route Handler that runs revalidateTag('posts', 'max') or revalidatePath",
        "Switch the whole site to SSR",
        "Redeploy on every publish",
      ],
      answer: 1,
      explain: "On-demand ISR keeps pages static and invalidates them exactly when content changes.",
    },
    {
      id: "isr-3",
      q: "Which header value tells you ISR served stale content?",
      options: ["x-nextjs-cache: MISS", "x-nextjs-cache: STALE", "cache-control: no-store", "x-nextjs-prerender: 0"],
      answer: 1,
      explain: "STALE means the response came from cache past its revalidate window and a background regeneration was triggered.",
    },
    {
      id: "isr-4",
      q: "Can ISR show per-user data (e.g. 'Hello, Ada')?",
      options: [
        "Yes, it caches one copy per user",
        "No. ISR output is shared across all visitors; per-user parts need dynamic rendering, CSR, or PPR",
        "Yes, if you use cookies() inside the page",
        "Only on Vercel",
      ],
      answer: 1,
      explain: "Reading cookies() would make the route dynamic, so it wouldn't be ISR any more.",
    },
    {
      id: "isr-5",
      q: "In a Server Action you update a product and want the SAME response to show the new price. Next 16 API?",
      options: ["revalidateTag('product', 'max')", "updateTag('product')", "router.refresh()", "revalidate = 0"],
      answer: 1,
      explain: "updateTag expires the tag immediately, so the re-render triggered by the action reads fresh data. revalidateTag(…, 'max') is stale-while-revalidate.",
    },
  ],
  predict: [
    {
      id: "isr-p1",
      title: "Three requests around expiry",
      code: `export const revalidate = 10;
export default async function P() {
  const t = await fetch(API + "/time").then(r => r.json());
  return <p>{t.servedAt}</p>;
}
// built at 12:00:00; requests at 12:00:05, 12:00:15, 12:00:16`,
      question: "Which timestamp does each request show?",
      answer: "12:00:05 shows 12:00:00 (HIT). 12:00:15 shows 12:00:00 (STALE, triggers regen). 12:00:16 shows about 12:00:15 (HIT, new).",
      explain: "Expiry doesn't block a request. It schedules regeneration, and the next request benefits.",
    },
    {
      id: "isr-p2",
      title: "revalidatePath in a Server Action",
      code: `"use server";
export async function publish() {
  await db.post.update(...);
  revalidatePath("/blog");
}`,
      question: "After the action finishes, does the user who clicked see the fresh /blog?",
      answer: "Yes. When a Server Action calls revalidatePath, Next re-renders and returns the fresh RSC payload for the current page in the same response.",
      explain: "Server Actions integrate with the cache: the client router receives the updated UI in one round trip.",
    },
  ],
};
