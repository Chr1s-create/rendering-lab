import type { Lesson } from "../../types";

export const pagesRouter: Lesson = {
  id: "pages-router",
  app: "classic",
  href: "/legacy",
  title: "Pages Router: the interview classics",
  tagline:
    "getStaticProps, getServerSideProps, getStaticPaths, and revalidate. Interviews still ask for these by name. Each one has a direct App Router equivalent.",
  notes: {
    what:
      "The Pages Router (pages/) is the Next.js model from 2016–2022. A page is a React component that can export data functions. getStaticProps runs at build (SSG) or on a revalidate interval (ISR). getServerSideProps runs on every request (SSR). getStaticPaths tells SSG which dynamic paths to prebuild. There are no Server Components: every page component hydrates in the browser.",
    where:
      "Data functions run only on the server (Node). The page component runs on the server to produce HTML and again in the browser to hydrate. That is why you cannot use Node APIs (fs, secrets) inside the component body — only inside getStaticProps / getServerSideProps.",
    when:
      "getStaticProps: build time, plus after `revalidate` seconds on the next request (ISR). getServerSideProps: every request, before HTML is sent (no streaming of the page itself). getStaticPaths: build time, to decide which [id] pages exist.",
    why:
      "Learn this for interviews and for older codebases. New work should use the App Router: async Server Components replace getServerSideProps, generateStaticParams replaces getStaticPaths, and fetch cache / revalidate / 'use cache' replace getStaticProps.",
    tradeoffs: [
      "+ Mental model is simple: one page file, one data function",
      "+ getServerSideProps guaranteed request-time data (cookies, req)",
      "- The whole page is a Client Component from React's point of view: more JS shipped",
      "- No streaming, no Server Components, no Server Actions",
      "- getServerSideProps blocks TTFB until the function finishes",
    ],
    mistakes: [
      "Putting server secrets in the page component instead of getServerSideProps",
      "Using getServerSideProps for data that could have been static (you pay SSR on every request)",
      "Forgetting getStaticPaths on a dynamic SSG page (build error)",
      "Confusing fallback: true (serve a fallback page, then fetch) with fallback: 'blocking' (wait, then cache)",
      "Assuming App Router getServerSideProps exists. It does not.",
    ],
    apis: [
      {
        name: "SSG",
        snippet: `export async function getStaticProps() {
  const data = await fetch(API + "/time?tag=legacy-ssg").then(r => r.json());
  return { props: { data } }; // runs at build
}`,
      },
      {
        name: "SSR",
        snippet: `export async function getServerSideProps(ctx) {
  const data = await fetch(API + "/time?tag=legacy-ssr").then(r => r.json());
  return { props: { data, q: ctx.query.q ?? null } }; // every request
}`,
      },
      {
        name: "ISR + paths",
        snippet: `export async function getStaticPaths() {
  return { paths: [{ params: { id: "1" } }], fallback: "blocking" };
}
export async function getStaticProps({ params }) {
  return { props: { id: params.id }, revalidate: 10 };
}`,
      },
    ],
  },
  tryThis: [
    "Open /legacy/ssg in production and reload. The timestamp stays put — getStaticProps ran at build.",
    "Open /legacy/ssr and reload. The timestamp moves — getServerSideProps ran again.",
    "Open /legacy/isr, wait 10s, reload twice. First reload after the window is STALE; the next shows new HTML.",
    "Open /legacy/csr. View-source: the product list marker is missing until JS runs.",
    "Visit /legacy/paths/1 (prebuilt) and /legacy/paths/99 (fallback: 'blocking' — generated on demand, then cached).",
    "Compare each file with its App Router twin linked from the comparison table.",
  ],
  verify: [
    {
      label: "SSG timestamp is stable",
      cmd: `bash scripts/verify-legacy.sh`,
      expect: "legacy/ssg timestamps match; legacy/ssr timestamps differ; CSR marker is absent from HTML.",
    },
  ],
  flashcards: [
    {
      q: "What is the App Router replacement for getServerSideProps?",
      a: "An async Server Component that reads cookies()/headers()/searchParams or fetches with cache: 'no-store'. The page becomes dynamic.",
    },
    {
      q: "What is the App Router replacement for getStaticProps?",
      a: "An async Server Component that uses no dynamic APIs. Optionally fetch with cache: 'force-cache' or, in the modern app, 'use cache'.",
    },
    {
      q: "What is the App Router replacement for getStaticPaths?",
      a: "generateStaticParams. dynamicParams replaces fallback: false (false → 404) vs true/'blocking' (render on demand).",
    },
    {
      q: "Where is it safe to use process.env.SECRET in the Pages Router?",
      a: "Only inside getStaticProps / getServerSideProps / API routes. The page component ships to the browser.",
    },
    {
      q: "What does fallback: 'blocking' mean?",
      a: "Unknown paths wait on the server for getStaticProps (like SSR once), then the result is cached as a static page. The user never sees a fallback spinner.",
    },
    {
      q: "Does the Pages Router have Server Components?",
      a: "No. Every page hydrates. That is the biggest bundle and composition difference versus the App Router.",
    },
  ],
  mcq: [
    {
      id: "pr-1",
      q: "Which export makes a Pages Router page render on every request?",
      options: ["getStaticProps", "getServerSideProps", "getInitialProps in _app only", "export const dynamic"],
      answer: 1,
      explain: "getServerSideProps is SSR. getStaticProps is SSG/ISR. dynamic is App Router only.",
    },
    {
      id: "pr-2",
      q: "getStaticProps returns { props, revalidate: 60 }. What is this?",
      options: ["SSR", "CSR", "ISR", "PPR"],
      answer: 2,
      explain: "Time-based Incremental Static Regeneration. The App Router equivalent is export const revalidate = 60.",
    },
    {
      id: "pr-3",
      q: "getStaticPaths returns { paths: [{ params: { id: '1' } }], fallback: false }. What is /paths/2?",
      options: ["Rendered on demand and cached", "404", "CSR", "Redirect to /paths/1"],
      answer: 1,
      explain: "fallback: false means only listed paths exist. App Router: dynamicParams = false.",
    },
    {
      id: "pr-4",
      q: "Can you call cookies() inside a pages/ file?",
      options: [
        "Yes, it's the same API",
        "No — read ctx.req.cookies in getServerSideProps",
        "Only in getStaticProps",
        "Only in _document",
      ],
      answer: 1,
      explain: "cookies() is an App Router server API. Pages Router uses the Node req object.",
    },
    {
      id: "pr-5",
      q: "Why is getServerSideProps often slower than an App Router Server Component?",
      options: [
        "It uses PHP",
        "It blocks the entire HTML until the function finishes; App Router can stream with Suspense",
        "It always runs on the Edge",
        "It cannot cache fetch",
      ],
      answer: 1,
      explain: "getServerSideProps is all-or-nothing. App Router can send a shell first and stream the rest.",
    },
  ],
  predict: [
    {
      id: "pr-p1",
      title: "Which function ran?",
      code: `export async function getStaticProps() {
  return { props: { t: Date.now() }, revalidate: 10 };
}
export default function Page({ t }) { return t; }`,
      question: "You reload twice within 2 seconds in production. Do the numbers match?",
      answer: "Yes. The page is cached. After 10s the next request regenerates it.",
      explain: "This is ISR via getStaticProps.revalidate.",
    },
    {
      id: "pr-p2",
      title: "Map the API",
      code: `// Pages: getStaticPaths + fallback: 'blocking'
// App:   ???`,
      question: "What is the App Router pair?",
      answer: "generateStaticParams + dynamicParams = true (default).",
      explain: "Unknown params render on first request, then cache. fallback: false maps to dynamicParams = false.",
    },
  ],
};
