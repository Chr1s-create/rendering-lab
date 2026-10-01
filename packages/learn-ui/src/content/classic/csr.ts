import type { Lesson } from "../../types";

export const csr: Lesson = {
  id: "csr",
  app: "classic",
  href: "/rendering/csr",
  title: "CSR: Client-Side Rendering",
  tagline:
    "The server sends a shell, and browser JavaScript fetches the data and renders it. In Next.js, CSR is something you do inside Client Components. It's never a whole-app mode.",
  notes: {
    what:
      "With client-side rendering, the data is fetched and turned into UI by JavaScript running in the browser after the page loads, typically in useEffect or through a library like SWR or TanStack Query. The HTML the server sends contains only the shell, such as a skeleton. The actual data never appears in that HTML.",
    where:
      "Data fetching and rendering happen in the BROWSER. The shell around it can still be static (SSG) or dynamic. The client either calls a public API directly or calls your own Route Handler, which acts as a backend-for-frontend and keeps secrets on the server.",
    when:
      "After hydration: the HTML arrives, JS downloads, React hydrates, effects run, the fetch happens, and then a re-render shows the data. Later it refetches on user interaction, a timer, or window focus.",
    why:
      "Highly interactive, user-specific, rapidly changing UI where SEO doesn't matter: dashboards behind a login, live tickers, infinite scroll, editors. The shell stays CDN-cached, so server cost is low.",
    tradeoffs: [
      "+ The shell can be fully static or CDN-cached, and data loads are cheap and granular",
      "+ Great for real-time updates or polling after first load",
      "- Data isn't in the initial HTML, so it's bad for SEO and link previews",
      "- Slower Largest Contentful Paint: you wait for HTML, then JS, then hydration, then the fetch round trip (a waterfall)",
      "- More JS shipped, plus you must handle loading, error, race, and cancellation states yourself",
      "- Any API key used in the browser is public",
    ],
    mistakes: [
      "Thinking 'use client' = CSR. A 'use client' page is still pre-rendered to HTML on the server. CSR only applies to data fetched after mount",
      "Fetching your own Route Handler from a Server Component (an extra HTTP hop). Call the data function directly instead",
      "Putting secrets in NEXT_PUBLIC_* env vars",
      "Not handling unmount and race conditions (AbortController), and not handling error states",
      "Using CSR for content that should be indexed",
    ],
    apis: [
      {
        name: "Fetch after mount",
        snippet: `"use client";
export function Products() {
  const [data, setData] = useState<Product[] | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/products", { signal: ac.signal }).then(r => r.json()).then(setData).catch(() => {});
    return () => ac.abort();
  }, []);
  if (!data) return <Skeleton />;
  return <List items={data} />;
}`,
      },
      {
        name: "Backend-for-frontend Route Handler",
        snippet: `// app/api/products/route.ts  (runs on the server; secrets stay here)
export async function GET() {
  const r = await fetch(UPSTREAM, { headers: { authorization: process.env.API_KEY! } });
  return Response.json(await r.json());
}`,
      },
      {
        name: "Skip SSR entirely for a component",
        snippet: `const Chart = dynamic(() => import("./chart"), { ssr: false, loading: () => <Skeleton /> });
// ssr:false is only allowed inside Client Components`,
      },
    ],
  },
  tryThis: [
    "Open /rendering/csr and watch the products list show a skeleton first, then the data. Open DevTools > Network: there's a browser request to the mock API (or to /api/products).",
    "Click 'check raw HTML'. The CSR marker is NOT in the server HTML. Compare it with the SSG page, where it is.",
    "Disable JavaScript in DevTools and reload. The page shell renders, but the CSR data never appears.",
    "Open /rendering/csr/client-page, a page whose file starts with 'use client'. Run the view-source check: its content IS in the HTML. 'use client' still gets SSR'd.",
    "Toggle 'refetch on window focus', switch tabs, and come back. The data refetches and the upstream counter goes up.",
  ],
  verify: [
    {
      label: "Data absent from HTML",
      cmd: `bash scripts/verify-csr.sh`,
      expect: "The csr-data marker is not found in the HTML, the skeleton marker is found, and the client-page marker is found (a 'use client' page is SSR'd).",
    },
    {
      label: "BFF route handler",
      cmd: `curl -s localhost:3000/api/products | head -c 200`,
      expect: "JSON products. The browser calls this endpoint and never sees the upstream URL.",
    },
  ],
  flashcards: [
    {
      q: "Is a page with 'use client' at the top client-side rendered?",
      a: "Not on first load. It's pre-rendered to HTML on the server (statically or dynamically), then hydrated. Only data fetched after mount (useEffect, SWR) is CSR.",
    },
    {
      q: "Main SEO and performance costs of CSR?",
      a: "The data isn't in the initial HTML, so crawlers and link unfurlers may miss it. LCP waits for HTML, then JS, then hydration, then the fetch round trip.",
    },
    {
      q: "When is CSR the right choice in Next.js?",
      a: "For user-specific, highly interactive, frequently updating UI that doesn't need SEO, for example dashboards, live data, or editors. Put it inside a static shell.",
    },
    {
      q: "Why use a Route Handler as a BFF for client fetches?",
      a: "It keeps API keys and internal URLs on the server. It can also reshape and cache responses, and it avoids CORS. The browser calls only your origin.",
    },
    {
      q: "How do you completely skip server rendering for a component?",
      a: "next/dynamic(() => import('./x'), { ssr: false }) from inside a Client Component, or render only after a mounted flag is set in useEffect.",
    },
    {
      q: "Should a Server Component fetch your own /api route?",
      a: "No. It adds an extra HTTP hop, and at build time the server may not be running. Call the underlying data function directly.",
    },
  ],
  mcq: [
    {
      id: "csr-1",
      q: "A component fetches in useEffect. Where does its data appear?",
      options: [
        "In the initial HTML",
        "Only in the browser after hydration and the fetch",
        "In the RSC payload",
        "In the Full Route Cache",
      ],
      answer: 1,
      explain: "Effects run only in the browser, after hydration, so the server HTML contains only the loading state.",
    },
    {
      id: "csr-2",
      q: "Which env var is visible to the browser?",
      options: ["API_SECRET", "DATABASE_URL", "NEXT_PUBLIC_API_URL", "NEXTAUTH_SECRET"],
      answer: 2,
      explain: "Only NEXT_PUBLIC_* values are inlined into the client bundle at build time.",
    },
    {
      id: "csr-3",
      q: "`dynamic(() => import('./map'), { ssr: false })` inside a Server Component file:",
      options: ["Works fine", "Errors: ssr:false isn't allowed in Server Components", "Renders the map on the server", "Makes the route dynamic"],
      answer: 1,
      explain: "ssr:false must be used inside a Client Component. Wrap it in a small 'use client' file.",
    },
    {
      id: "csr-4",
      q: "Best pattern for a public product catalog that must rank on Google?",
      options: ["CSR with useEffect", "SSG/ISR, with the data in the HTML", "next/dynamic ssr:false", "Fetch in a Web Worker"],
      answer: 1,
      explain: "Indexed content should be in the server HTML. Use SSG/ISR, or SSR if it's personalised.",
    },
    {
      id: "csr-5",
      q: "What's the main risk of a fetch in useEffect without cleanup?",
      options: [
        "It runs on the server",
        "A race condition: a stale response can overwrite newer state, or state can be set after unmount",
        "It becomes cached forever",
        "It breaks SSG",
      ],
      answer: 1,
      explain: "Use AbortController or an ignore flag in the cleanup, or use a data library such as SWR or TanStack Query.",
    },
  ],
  predict: [
    {
      id: "csr-p1",
      title: "curl a CSR page",
      code: `"use client";
export default function Page() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => { fetch("/api/count").then(r => r.json()).then(d => setN(d.n)); }, []);
  return <p>{n === null ? "Loading..." : \`Count: \${n}\`}</p>;
}`,
      question: "What does `curl /page` return inside <p>?",
      answer: "\"Loading...\"",
      explain: "The page is SSR'd (static), but effects never run on the server, so the HTML has the initial state only.",
    },
    {
      id: "csr-p2",
      title: "Strict Mode in dev",
      code: `useEffect(() => { fetch("/api/hit"); }, []);`,
      question: "In `next dev`, how many requests does /api/hit receive on mount? And in production?",
      answer: "Two in dev, one in production.",
      explain: "In development, React Strict Mode mounts, unmounts, and remounts components to surface missing cleanups.",
    },
  ],
};
