import type { Lesson } from "../../types";

export const ssg: Lesson = {
  id: "ssg",
  app: "classic",
  href: "/rendering/ssg",
  title: "SSG: Static Site Generation",
  tagline:
    "The HTML is rendered once, at build time (or the first time a path is requested), then served from a cache to everyone. This is the default in the App Router.",
  notes: {
    what:
      "Static rendering means Next.js runs your Server Components ahead of time and stores the result: the HTML plus the RSC payload. This store is the Full Route Cache. Every visitor gets the same bytes, with no per-request server work, and a CDN can cache them.",
    where:
      "Server Components run on the BUILD machine during `next build`. Paths not listed in generateStaticParams run on the server the first time they're requested. The browser only receives HTML, the RSC payload, and the JS for any Client Components.",
    when:
      "At build time. For dynamic segments, generateStaticParams decides which paths are built ahead of time. With dynamicParams = true (the default), other paths are rendered on their first request and then cached. With dynamicParams = false, they return 404.",
    why:
      "Pick SSG for content that is the same for everyone and rarely changes: marketing pages, docs, blog posts. It gives you the best TTFB, the cheapest hosting, and full SEO.",
    tradeoffs: [
      "+ Fastest possible response, CDN-cacheable, no server cost per request",
      "+ Works if the data source is down after build (the HTML is already generated)",
      "- Data is frozen at build time until you redeploy or revalidate (see ISR)",
      "- Building thousands of pages makes builds slow; prebuild the popular paths and render the rest on demand",
      "- Cannot depend on request data (cookies, headers, searchParams). Reading any of them makes the route dynamic",
    ],
    mistakes: [
      "Thinking fetch() is cached by default. Since Next 15 fetch is NOT cached by default, but the route is still prerendered when it uses no dynamic APIs, so the data gets baked into the static HTML anyway",
      "Accidentally opting out of static rendering by calling cookies() or headers(), or by reading searchParams in a layout",
      "Testing SSG in `next dev`, which renders on every request",
      "Returning thousands of entries from generateStaticParams when a handful would do",
    ],
    apis: [
      {
        name: "Static page (default)",
        snippet: `export default async function Page() {
  const data = await fetch("https://api/posts", { cache: "force-cache" }).then(r => r.json());
  return <List items={data} />; // rendered at build, served from the Full Route Cache
}`,
      },
      {
        name: "generateStaticParams + dynamicParams",
        snippet: `export const dynamicParams = true; // false -> unknown slugs 404

export async function generateStaticParams() {
  const { posts } = await fetch(API + "/posts").then(r => r.json());
  return posts.slice(0, 2).map((p) => ({ slug: p.slug }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // params is a Promise in Next 15+
  ...
}`,
      },
      {
        name: "Force it (escape hatch)",
        snippet: `export const dynamic = "force-static"; // cookies()/headers() return empty values instead of opting out`,
      },
    ],
  },
  tryThis: [
    "Run `pnpm build`. In the route table, find /rendering/ssg (○ Static) and /rendering/ssg/[slug] (● SSG, with its prebuilt paths listed).",
    "Open /rendering/ssg in production mode and reload 5 times. 'HTML generated at' never changes, and the mock-api hit count for /time?tag=ssg stays the same. It was called once, during the build.",
    "Visit /rendering/ssg/hello-ssg. It was prebuilt, so it returns x-nextjs-cache: HIT straight away.",
    "Visit /rendering/ssg/ssr-tradeoffs. It is NOT in generateStaticParams, so the first request renders it (MISS) and the next ones are cached (HIT). This is on-demand static generation.",
    "Visit /rendering/ssg/does-not-exist. You get notFound() and a 404.",
    "Bonus: add `export const dynamicParams = false` to the [slug] page and rebuild. /rendering/ssg/ssr-tradeoffs now 404s.",
  ],
  verify: [
    {
      label: "Same HTML on every request",
      cmd: `bash scripts/verify-ssg.sh`,
      expect: "The timestamp is identical across 3 requests, x-nextjs-cache is HIT, and the upstream hit count does not change.",
    },
    {
      label: "Inspect manually",
      cmd: `curl -sI http://localhost:3000/rendering/ssg | grep -i -E 'x-nextjs-cache|cache-control'`,
      expect: "x-nextjs-cache: HIT and cache-control: s-maxage=31536000 (cache for one year at the CDN).",
    },
    {
      label: "Data is in the HTML (SEO)",
      cmd: `curl -s http://localhost:3000/rendering/ssg | grep -o 'data-marker="ssg-posts"'`,
      expect: "Prints the marker. The post list is in the raw HTML, so crawlers see it with no JS.",
    },
  ],
  flashcards: [
    {
      q: "Where and when do Server Components run for a statically rendered route?",
      a: "On the build machine during `next build`, or on the server the first time an on-demand path is requested. Afterwards the stored HTML and RSC payload are served without running your code again.",
    },
    {
      q: "What two artifacts does Next store for a static App Router route?",
      a: "The HTML (for the first page load) and the RSC payload (used for client-side <Link> navigation). Together they make up the Full Route Cache.",
    },
    {
      q: "What does generateStaticParams do and what does dynamicParams control?",
      a: "generateStaticParams returns the dynamic-segment values to prerender at build. dynamicParams (default true) controls what happens to other values: true renders them on demand and caches them, false returns a 404.",
    },
    {
      q: "Is fetch() cached by default in Next 15/16?",
      a: "No. The default is no caching in the Data Cache. But if the route uses no dynamic APIs it is still statically prerendered, so the fetched data is baked into the static HTML. Use cache: 'force-cache' or next.revalidate to cache the data itself.",
    },
    {
      q: "Name three things that silently turn a static route dynamic.",
      a: "Calling cookies(), headers(), or connection(); reading searchParams; fetch with cache: 'no-store'; export const dynamic = 'force-dynamic'; or export const revalidate = 0.",
    },
    {
      q: "How do you confirm a route is static without reading code?",
      a: "Look at the `next build` route table (○ or ●), the response header x-nextjs-cache: HIT, a cache-control header with a long s-maxage, and a timestamp that never changes between reloads.",
    },
  ],
  mcq: [
    {
      id: "ssg-1",
      q: "A page fetches data with no cache options and uses no cookies, headers, or searchParams. What happens in production?",
      options: [
        "It's rendered on every request because fetch isn't cached",
        "It's prerendered at build. The data is frozen into the HTML until a rebuild or revalidation",
        "Build fails: you must pass cache: 'force-cache'",
        "It renders in the browser",
      ],
      answer: 1,
      explain:
        "The route has no dynamic inputs, so Next prerenders it. The fetch result isn't stored in the Data Cache, but it ends up inside the static HTML.",
    },
    {
      id: "ssg-2",
      q: "generateStaticParams returns ['a','b']. dynamicParams is left at its default. A user requests /post/c. What happens?",
      options: ["404", "500 error", "Rendered on demand, then cached for later requests", "Rendered client-side"],
      answer: 2,
      explain: "dynamicParams defaults to true, so unknown params are rendered on first request and then stored in the Full Route Cache.",
    },
    {
      id: "ssg-3",
      q: "Which build output symbol means 'prerendered as static HTML using generateStaticParams'?",
      options: ["○", "●", "ƒ", "◐"],
      answer: 1,
      explain: "○ is static with no params, ● is SSG with generateStaticParams, ƒ is dynamic, and ◐ is partial prerender (cacheComponents).",
    },
    {
      id: "ssg-4",
      q: "Why might SSG look 'broken' in development?",
      options: [
        "Dev mode disables Server Components",
        "next dev renders routes on each request, so timestamps change on every reload",
        "Dev uses the edge runtime",
        "generateStaticParams is ignored in dev and pages 404",
      ],
      answer: 1,
      explain: "In dev, routes render on demand so you see edits immediately. Always verify caching with next build + next start.",
    },
    {
      id: "ssg-5",
      q: "A layout reads `await cookies()` to show a theme. What happens to every static page under it?",
      options: [
        "Nothing; layouts don't affect pages",
        "They all become dynamic (rendered per request)",
        "Only the layout becomes dynamic, and the pages stay static",
        "Build error",
      ],
      answer: 1,
      explain:
        "A route is rendered as a whole in the classic model. Any dynamic API anywhere in its layout tree makes the whole route dynamic. (Cache Components / PPR solves this with Suspense boundaries.)",
    },
  ],
  predict: [
    {
      id: "ssg-p1",
      title: "Reload three times",
      code: `// app/now/page.tsx (production)
export default function Page() {
  return <p>{new Date().toISOString()}</p>;
}`,
      question: "You reload /now three times, 5 seconds apart. What do you see?",
      answer: "The same timestamp each time: the time `next build` ran.",
      explain: "There are no dynamic APIs, so the page is static. new Date() ran once, at build.",
    },
    {
      id: "ssg-p2",
      title: "dynamicParams = false",
      code: `export const dynamicParams = false;
export function generateStaticParams() { return [{ id: "1" }, { id: "2" }]; }
export default async function P({ params }) { const { id } = await params; return <p>{id}</p>; }`,
      question: "What do /item/2 and /item/3 return?",
      answer: "/item/2 returns 200 (prebuilt). /item/3 returns 404.",
      explain: "With dynamicParams = false, only the params returned by generateStaticParams exist.",
    },
  ],
};
