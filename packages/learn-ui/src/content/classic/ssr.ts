import type { Lesson } from "../../types";

export const ssr: Lesson = {
  id: "ssr",
  app: "classic",
  href: "/rendering/ssr",
  title: "SSR: Dynamic rendering per request",
  tagline:
    "The server renders fresh HTML for every request. You need it when the output depends on the request itself (cookies, headers, search params) or must never be stale.",
  notes: {
    what:
      "Dynamic rendering (\"SSR\") runs your Server Components on every incoming request. Nothing goes into the Full Route Cache. The HTML is streamed to the browser, and Client Components inside it then hydrate. In the App Router you don't opt in with a special function like getServerSideProps. A route becomes dynamic automatically as soon as it reads request-time data.",
    where:
      "On the server (a Node.js process, or an Edge runtime if you choose it) for every request. Client Components are still pre-rendered to HTML there, then hydrated in the browser.",
    when:
      "At request time. Triggers include `await cookies()`, `await headers()`, reading `searchParams`, `await connection()`, `fetch(..., { cache: 'no-store' })`, `export const dynamic = 'force-dynamic'`, and `export const revalidate = 0`. Server Actions and draftMode also run at request time.",
    why:
      "Pick SSR for personalised or real-time pages that also need SEO or a fast first paint: dashboards with server data, search results pages, pages that check auth or read A/B cookies, and prices that must be exact.",
    tradeoffs: [
      "+ Always fresh, and can personalise per user/request",
      "+ Secrets and DB access stay on the server, with no client fetch waterfall",
      "- TTFB includes your data-fetching time (use streaming/Suspense to mitigate)",
      "- Costs server compute on every request and can't be served from the CDN (cache-control: private, no-store)",
      "- One slow dependency can block the whole page unless you add Suspense boundaries",
    ],
    mistakes: [
      "Believing 'use client' means 'not SSR'. Client Components are SSR'd too",
      "Making a whole page dynamic by reading cookies() in the root layout when only one widget needs it",
      "Forgetting that cookies(), headers(), params, and searchParams are async (Promises) in Next 15+",
      "Using SSR for content that is identical for everyone (use SSG or ISR instead)",
      "Trying to set cookies while rendering a Server Component. You can only set them in Server Actions, Route Handlers, or proxy.ts",
    ],
    apis: [
      {
        name: "Dynamic via request APIs",
        snippet: `import { cookies, headers } from "next/headers";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;              // dynamic
  const ua = (await headers()).get("user-agent"); // dynamic
  const theme = (await cookies()).get("theme");   // dynamic
  ...
}`,
      },
      {
        name: "Dynamic via data",
        snippet: `const data = await fetch(url, { cache: "no-store" }); // dynamic + never cached`,
      },
      {
        name: "Explicit opt-in",
        snippet: `export const dynamic = "force-dynamic";
// or: import { connection } from "next/server"; await connection();`,
      },
    ],
  },
  tryThis: [
    "Open /rendering/ssr in production and reload. 'HTML generated at' changes every time, and the mock-api counter for tag=ssr goes up by 1 per reload.",
    "Type a name in the cookie form and submit. A Server Action sets a cookie, and the page re-renders on the server with your name. View the source: your name is in the HTML.",
    "Add ?q=hello to the URL. searchParams are read on the server and rendered into the HTML.",
    "Visit each trigger page (/rendering/ssr/triggers/*). Every one except 'none' changes its timestamp on reload. Compare them with the ƒ and ○ symbols in the `pnpm build` output.",
    "Check cache-control on an SSR page: it is private, no-cache, no-store, so CDNs will not cache it.",
  ],
  verify: [
    {
      label: "Fresh HTML on every request",
      cmd: `bash scripts/verify-ssr.sh`,
      expect: "Every request returns a different timestamp, cache-control is 'private, no-cache, no-store...', and the upstream counter increases by the number of requests.",
    },
    {
      label: "Each trigger makes the route dynamic",
      cmd: `for t in none cookies headers search-params no-store force-dynamic connection; do
  a=$(curl -s localhost:3000/rendering/ssr/triggers/$t | grep -o 'data-ts="[^"]*"' | head -1); sleep 1
  b=$(curl -s localhost:3000/rendering/ssr/triggers/$t | grep -o 'data-ts="[^"]*"' | head -1)
  [ "$a" = "$b" ] && echo "$t: STATIC" || echo "$t: DYNAMIC"; done`,
      expect: "'none' prints STATIC. Every other trigger prints DYNAMIC.",
    },
    {
      label: "Personalised HTML from a cookie",
      cmd: `curl -s -H 'Cookie: lab-name=Ada' localhost:3000/rendering/ssr | grep -o 'Hello, Ada'`,
      expect: "Prints 'Hello, Ada'. The server read the cookie and rendered it into the HTML.",
    },
  ],
  flashcards: [
    {
      q: "How do you opt into SSR in the App Router?",
      a: "Usually you don't do it explicitly. A route becomes dynamic as soon as it uses request-time data: cookies(), headers(), searchParams, connection(), or fetch with no-store. You can force it with export const dynamic = 'force-dynamic'.",
    },
    {
      q: "Are Client Components server-side rendered?",
      a: "Yes. On the first load, Client Components are rendered to HTML on the server, then hydrated in the browser. 'use client' marks a boundary for shipping JS and enabling interactivity. It does not mean 'skip the server'.",
    },
    {
      q: "What cache-control header does a dynamic route send?",
      a: "private, no-cache, no-store, max-age=0, must-revalidate. Shared caches and CDNs must not store it.",
    },
    {
      q: "Why are cookies(), headers(), params and searchParams async in Next 15+?",
      a: "So Next can prerender as much as possible and only wait for request data where it's actually used. This enables streaming and Partial Prerendering. Accessing them is a signal to the renderer.",
    },
    {
      q: "Where can you SET a cookie in the App Router?",
      a: "In Server Actions, Route Handlers, and proxy.ts. Not while rendering a Server Component, because the response headers have already been sent while streaming.",
    },
    {
      q: "SSR vs CSR for a logged-in dashboard: when choose which?",
      a: "Choose SSR (with streaming) if the first paint should contain data, or if you want secrets and DB access kept on the server. Choose CSR if the data changes constantly after load, SEO doesn't matter, and you want a static, CDN-served shell.",
    },
  ],
  mcq: [
    {
      id: "ssr-1",
      q: "Which one does NOT make an App Router route dynamic?",
      options: ["await cookies()", "fetch(url, { cache: 'force-cache' })", "await headers()", "reading searchParams in the page"],
      answer: 1,
      explain: "force-cache stores the response in the Data Cache, which is compatible with static rendering. The others read request-time data.",
    },
    {
      id: "ssr-2",
      q: "You add 'use client' to a page that fetches nothing. Is its HTML present in the server response?",
      options: [
        "No, client pages are rendered only in the browser",
        "Yes, Client Components are pre-rendered to HTML on the server and then hydrated",
        "Only when JavaScript is disabled",
        "Only with export const dynamic = 'force-dynamic'",
      ],
      answer: 1,
      explain: "'use client' still gets SSR/SSG for the first load. To skip server rendering, use next/dynamic with ssr: false, or render after mount.",
    },
    {
      id: "ssr-3",
      q: "TTFB on an SSR page is 2s because one fetch is slow. What's the best App Router fix that keeps the data server-rendered?",
      options: [
        "Move the fetch into useEffect",
        "Wrap the slow component in <Suspense> so the shell streams first",
        "Add export const revalidate = 2",
        "Use getServerSideProps",
      ],
      answer: 1,
      explain: "Streaming sends the shell immediately and streams the slow part when it's ready, still as server-rendered HTML.",
    },
    {
      id: "ssr-4",
      q: "Where should you write `cookies().set('theme','dark')`?",
      options: ["In a Server Component", "In a Server Action or Route Handler", "In layout.tsx", "In generateMetadata"],
      answer: 1,
      explain: "Rendering can't modify response headers. Mutations happen in Server Actions, Route Handlers, or proxy.ts.",
    },
    {
      id: "ssr-5",
      q: "In Next 15+, what is the type of `params` in a page component?",
      options: ["{ slug: string }", "Promise<{ slug: string }>", "URLSearchParams", "ReadonlyMap"],
      answer: 1,
      explain: "params and searchParams are Promises, so you must await them (or use React's use() in Client Components).",
    },
  ],
  predict: [
    {
      id: "ssr-p1",
      title: "Layout reads a cookie",
      code: `// app/layout.tsx
const theme = (await cookies()).get("theme")?.value;

// app/about/page.tsx
export default function About() { return <p>{Date.now()}</p>; }`,
      question: "Is /about static or dynamic, and does the number change on reload?",
      answer: "Dynamic. The number changes on every reload.",
      explain: "The layout is part of every route's render, so reading a cookie there opts every route under it into dynamic rendering in the classic model.",
    },
    {
      id: "ssr-p2",
      title: "Client page with a timestamp",
      code: `"use client";
export default function Page() { return <p>{new Date().toISOString()}</p>; }`,
      question: "In production, does the raw HTML (curl) contain a timestamp? Will it change between curls?",
      answer: "Yes, the HTML contains a timestamp, and it does NOT change between curls: the page is static, built at build time. The browser may also log a hydration mismatch because the client renders a different time.",
      explain: "Client Components are prerendered too. Nothing makes this route dynamic, so it's static, and rendering non-deterministic values causes a hydration mismatch.",
    },
  ],
};
