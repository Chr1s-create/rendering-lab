import type { Lesson } from "../../types";

export const runtime: Lesson = {
  id: "runtime",
  app: "classic",
  href: "/runtime",
  title: "Edge vs Node.js runtime & proxy.ts",
  tagline:
    "Where does server code physically run? Node.js has the full API surface. Edge is a lightweight V8-isolate runtime with Web APIs only. proxy.ts (formerly middleware) intercepts requests before routing.",
  notes: {
    what:
      "Next.js server code can run in two runtimes. Node.js is the default: full Node APIs (fs, crypto, native modules, any npm package), and it supports ISR, 'use cache', and every feature. Edge (`export const runtime = 'edge'`) runs in V8 isolates with Web-standard APIs only (fetch, Request, Response, crypto.subtle, streams). It has a small bundle limit and no fs or native modules. proxy.ts is the Next 16 name for middleware: a function that runs before every matched request and can rewrite, redirect, set headers and cookies, or return a response.",
    where:
      "Node: a server or serverless function in one region (on Vercel, Fluid compute). Edge: V8 isolates, potentially close to the user. proxy.ts runs in front of the route (Node.js runtime by default in Next 16) on every matched request, BEFORE any cache lookup for the page.",
    when:
      "Route code runs per request (or at build when static). proxy.ts runs on every request that matches `config.matcher`, including requests for static pages, so keep it fast.",
    why:
      "Default to Node.js. Choose Edge only for tiny, latency-sensitive handlers with no Node dependencies, such as geo redirects or simple header logic. Since Vercel's Fluid compute, Node is usually just as fast and much more capable. Use proxy.ts for cross-cutting request logic: auth gates (optimistic checks), A/B bucketing, i18n redirects, rewrites, and security headers.",
    tradeoffs: [
      "+ Edge: tiny cold starts and Web-standard APIs",
      "+ Node: full ecosystem, plus ISR, 'use cache', and Cache Components support",
      "- Edge: no fs, no native modules, limited npm compatibility, size limits. Edge is not supported with cacheComponents",
      "- proxy.ts adds latency to EVERY matched request. Don't do slow DB calls there",
      "- A database far from an Edge region erases the latency win (a network round trip per query)",
    ],
    mistakes: [
      "Using middleware.ts in Next 16. Rename it to proxy.ts and export `proxy` (the codemod handles it)",
      "Doing full auth or DB lookups in proxy. Do cheap optimistic checks there, and real authorization next to the data",
      "Matching every path, including _next/static and images, so proxy runs for every asset",
      "Assuming Edge is always faster. A function in the same region as your DB is usually faster overall",
      "Importing a Node-only package into an Edge route (build error or runtime crash)",
    ],
    apis: [
      {
        name: "Choose a runtime per route",
        snippet: `// app/api/geo/route.ts
export const runtime = "edge";   // default is "nodejs"
export function GET(req: Request) { return Response.json({ ok: true }); }`,
      },
      {
        name: "proxy.ts (Next 16)",
        snippet: `import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/old") return NextResponse.redirect(new URL("/new", request.url));
  const res = NextResponse.next();
  res.headers.set("x-proxy-seen", "1");
  return res;
}
export const config = { matcher: ["/runtime/:path*"] };`,
      },
      {
        name: "A/B rewrite with a sticky cookie",
        snippet: `const bucket = request.cookies.get("ab")?.value ?? (Math.random() < 0.5 ? "a" : "b");
const res = NextResponse.rewrite(new URL(\`/runtime/ab/\${bucket}\`, request.url));
res.cookies.set("ab", bucket);  // URL stays /runtime/ab, content differs`,
      },
    ],
  },
  tryThis: [
    "Click 'call both 5×' on /runtime. Compare the latency and what each runtime reports (process.version is only on Node, EdgeRuntime only on Edge).",
    "Inspect the headers on /runtime. x-proxy-seen is set by proxy.ts, and the page also shows the request header that proxy injected.",
    "Visit /runtime/ab several times. The URL stays the same, but you always get the same variant: a sticky cookie plus a rewrite. Clear the ab-bucket cookie to get re-bucketed.",
    "Visit /runtime/old-path. proxy.ts sends a 307 redirect to /runtime.",
    "Experiment: import 'node:fs' in app/api/runtime/edge/route.ts and run `pnpm build`. The build fails for the Edge runtime.",
  ],
  verify: [
    {
      label: "Runtimes + proxy",
      cmd: `bash scripts/verify-runtime.sh`,
      expect: "node reports runtime=nodejs with a node version, edge reports runtime=edge. x-proxy-seen is present. /runtime/old-path returns 307. /runtime/ab is sticky for the same cookie.",
    },
  ],
  flashcards: [
    {
      q: "Edge vs Node runtime: key differences?",
      a: "Edge runs in V8 isolates with Web APIs only: no fs or native modules, a size limit, fast cold starts. Node has the full API surface and supports every Next feature (ISR, 'use cache'). Node is the default and the recommendation.",
    },
    {
      q: "What is proxy.ts?",
      a: "The Next 16 rename of middleware.ts. It exports a `proxy(request)` function that runs before routing for matched paths and can rewrite, redirect, set headers and cookies, or respond directly.",
    },
    {
      q: "Rewrite vs redirect?",
      a: "A rewrite serves different content at the SAME URL, invisibly to the user. A redirect tells the browser to go to a NEW URL with a 307 or 308, and the URL bar changes.",
    },
    {
      q: "Why shouldn't you do heavy auth checks in proxy?",
      a: "It runs on every matched request, adding latency to all of them, and it's easy to bypass through matcher gaps. Do optimistic cookie checks there and real authorization in the data layer or Server Actions.",
    },
    {
      q: "Does proxy.ts run for statically cached pages?",
      a: "Yes. It runs before the cache lookup, which is what lets you rewrite or redirect static pages (for example A/B testing between two static variants).",
    },
  ],
  mcq: [
    {
      id: "rt-1",
      q: "A Route Handler needs `sharp` (a native module) to resize images. Runtime?",
      options: ["edge", "nodejs", "either", "browser"],
      answer: 1,
      explain: "Native modules need Node.js.",
    },
    {
      id: "rt-2",
      q: "In Next 16, the middleware file and function are named:",
      options: ["middleware.ts / middleware()", "proxy.ts / proxy()", "edge.ts / handler()", "_middleware.ts / default"],
      answer: 1,
      explain: "Next 16 renamed middleware to proxy. The old name is deprecated.",
    },
    {
      id: "rt-3",
      q: "You want two static variants of the homepage for an A/B test without changing the URL. Best tool?",
      options: ["SSR with cookies()", "proxy.ts rewrite based on a bucket cookie", "Client-side redirect", "ISR"],
      answer: 1,
      explain: "Both variants stay static and CDN-cacheable, and proxy decides which one to serve.",
    },
    {
      id: "rt-4",
      q: "Which of these is NOT available in the Edge runtime?",
      options: ["fetch", "crypto.subtle", "fs.readFileSync", "Response"],
      answer: 2,
      explain: "There's no filesystem access in Edge.",
    },
    {
      id: "rt-5",
      q: "Your DB is in us-east-1 and you deploy an Edge function globally that makes 5 sequential queries per request. Users in Tokyo get:",
      options: [
        "Faster responses because of the edge",
        "Likely slower responses: 5 trans-Pacific round trips",
        "The same speed",
        "Errors",
      ],
      answer: 1,
      explain: "Put compute next to the data. Regional Node functions win for chatty DB access.",
    },
  ],
  predict: [
    {
      id: "rt-p1",
      title: "Matcher",
      code: `export const config = { matcher: ["/dashboard/:path*"] };`,
      question: "Does proxy run for /dashboard, /dashboard/a/b, and /about?",
      answer: "Yes for /dashboard and /dashboard/a/b. No for /about.",
      explain: ":path* matches zero or more segments.",
    },
    {
      id: "rt-p2",
      title: "Rewrite and the URL bar",
      code: `return NextResponse.rewrite(new URL("/variant-b", request.url));  // request was /home`,
      question: "What does the browser's URL bar show?",
      answer: "/home",
      explain: "Rewrites are server-side only. Use redirect if the URL should change.",
    },
  ],
};
