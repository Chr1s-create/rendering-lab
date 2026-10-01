import type { Lesson } from "../../types";

export const hydration: Lesson = {
  id: "hydration",
  app: "classic",
  href: "/hydration",
  title: "Hydration",
  tagline:
    "The server sends HTML. Then React attaches event handlers and state to that HTML in the browser. That attach step is hydration — and it fails if the two trees don't match.",
  notes: {
    what:
      "Hydration is React taking the HTML the server already painted and making it interactive. Client Components are pre-rendered to HTML on the server first. After the JS bundle loads, React walks that HTML, attaches listeners, and resumes state. It is not a second render from a blank page (that would be CSR). A hydration mismatch means the HTML React expected from the first client render did not match the HTML the server sent.",
    where:
      "The first HTML is produced on the SERVER (even for Client Components). Hydration itself runs in the BROWSER. `next/dynamic` with `ssr: false` skips the server HTML for that subtree: the browser renders it from scratch after JS loads.",
    when:
      "After the HTML is on screen and the Client Component JS has downloaded. Until then, the user sees the server HTML (or nothing, for `ssr: false`). `useEffect` never runs on the server, so it is the standard 'I am mounted' signal.",
    why:
      "Hydration is how Next.js gives you fast first paint (server HTML) plus interactivity (client JS). You need to understand mismatches because they are a common source of flicker, console errors, and 'it works in the browser but SEO is wrong' bugs.",
    tradeoffs: [
      "+ Server HTML paints immediately; users and crawlers see content before JS",
      "+ Client Components still participate in that first paint unless you opt out",
      "- The client must reproduce the same tree; Date, random, locale, and timezone differences break it",
      "- `ssr: false` avoids mismatches but costs SEO and causes a pop-in",
    ],
    mistakes: [
      "Rendering `Date.now()`, `Math.random()`, or `toLocaleString()` during render without a mounted guard",
      "Thinking `'use client'` means 'no server HTML'. Client Components still SSR",
      "Using `suppressHydrationWarning` as a blanket fix instead of isolating the unstable value",
      "Reading `window` or `localStorage` during render (it does not exist on the server)",
    ],
    apis: [
      {
        name: "Mounted guard (the usual fix)",
        snippet: `"use client";
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <span>—</span>;
return <span>{new Date().toLocaleString()}</span>;`,
      },
      {
        name: "suppressHydrationWarning (one text node only)",
        snippet: `<time suppressHydrationWarning>{new Date().toISOString()}</time>
// Tells React: this single text node is allowed to differ. Do not wrap a whole tree.`,
      },
      {
        name: "Client-only import",
        snippet: `import dynamic from "next/dynamic";
const Chart = dynamic(() => import("./chart"), { ssr: false, loading: () => <p>…</p> });`,
      },
    ],
  },
  tryThis: [
    "Open /hydration and the browser console. Toggle 'render Date.now() without a guard'. You should see a hydration mismatch warning.",
    "Leave the suppressed <time> as-is. React will not warn, even though the server and client timestamps differ.",
    "Watch the mounted-guard clock: it shows an em dash in the raw HTML, then the locale time after hydration.",
    "View-source the client-only widget: `data-marker=\"client-only-widget\"` is absent from the initial HTML.",
    "Disable JavaScript and reload. The mismatch and mounted-guard sections still show server HTML. The `ssr: false` widget is gone.",
  ],
  verify: [
    {
      label: "Client-only widget is not in the HTML",
      cmd: `curl -s http://localhost:3000/hydration | grep -c 'data-marker="client-only-widget"' || true`,
      expect: "0. next/dynamic with ssr:false omitted that subtree from the server HTML.",
    },
    {
      label: "Mounted guard placeholder is in the HTML",
      cmd: `curl -s http://localhost:3000/hydration | grep -o 'data-marker="mounted-guard"'`,
      expect: "The placeholder is server-rendered. The locale time is filled in after hydration.",
    },
  ],
  flashcards: [
    {
      q: "Do Client Components skip the server?",
      a: "No. They render to HTML on the server, then hydrate in the browser. Only `ssr: false` (or a mounted-only branch) skips server HTML.",
    },
    {
      q: "What is a hydration mismatch?",
      a: "The HTML React produces on the first client render does not match the HTML the server sent. React warns and often replaces the subtree.",
    },
    {
      q: "Why is useEffect a safe place for Date / window / localStorage?",
      a: "useEffect runs only after mount, so it never runs on the server. The first client render can match the server HTML.",
    },
    {
      q: "What does suppressHydrationWarning actually do?",
      a: "It silences the warning for one text or attribute on that element. It does not fix the underlying difference. Use it for things like timestamps you accept being different.",
    },
    {
      q: "When would you choose ssr: false?",
      a: "When a library needs `window` at import time, or when the UI is meaningless without JS (a canvas editor). Never for primary content you want indexed.",
    },
    {
      q: "Is hydration the same as CSR?",
      a: "No. CSR builds the tree from an empty shell after JS loads. Hydration attaches to existing HTML. Next.js does both: SSR/SSG HTML, then hydrate Client Components.",
    },
  ],
  mcq: [
    {
      id: "hyd-1",
      q: "A Client Component renders `{Math.random()}` during render. What happens?",
      options: [
        "It only runs in the browser, so it's fine",
        "Server and client generate different numbers; React reports a hydration mismatch",
        "Next.js caches the random value automatically",
        "Build fails",
      ],
      answer: 1,
      explain:
        "The component still SSR. The server's random number is in the HTML; the client's first render draws a different one.",
    },
    {
      id: "hyd-2",
      q: "Which code is the correct way to show a locale-formatted time?",
      options: [
        "return new Date().toLocaleString() in the component body",
        "Read it in useEffect after a mounted flag, and render a stable placeholder first",
        "Put it in a Server Component; Server Components hydrate too",
        "Wrap the whole page in suppressHydrationWarning",
      ],
      answer: 1,
      explain: "A stable first render matches the server. Then the effect fills in the locale-specific value.",
    },
    {
      id: "hyd-3",
      q: "A file starts with 'use client' and returns <h1>Pricing</h1>. Is 'Pricing' in the raw HTML?",
      options: [
        "No, 'use client' means CSR only",
        "Yes — Client Components still SSR unless you set ssr: false",
        "Only after hydration",
        "Only in production",
      ],
      answer: 1,
      explain: "This is the most common misconception. Check /rendering/csr/client-page and the view-source check.",
    },
    {
      id: "hyd-4",
      q: "What does next/dynamic(..., { ssr: false }) change?",
      options: [
        "The component becomes a Server Component",
        "The server omits that subtree; the browser renders it after JS loads",
        "It disables hydration for the whole page",
        "It caches the component at the edge",
      ],
      answer: 1,
      explain: "Useful for browser-only libraries. The cost is a blank hole until JS runs.",
    },
    {
      id: "hyd-5",
      q: "Why can toLocaleString() mismatch even if you pass the same Date?",
      options: [
        "Dates are not serializable",
        "The server and the user's browser may use different locales and timezones",
        "Next.js strips locale APIs on the server",
        "toLocaleString is async",
      ],
      answer: 1,
      explain: "The server often runs in UTC/en-US. The browser uses the user's locale. Format on the client after mount, or format on the server in a fixed locale.",
    },
  ],
  predict: [
    {
      id: "hyd-p1",
      title: "Random in a Client Component",
      code: `"use client";
export default function Page() {
  return <p>{Math.random()}</p>;
}`,
      question: "What does the console show on first load in production?",
      answer: "A hydration mismatch warning. Server HTML has one number; the client render has another.",
      explain: "Client Components still SSR. Random during render is a classic mismatch.",
    },
    {
      id: "hyd-p2",
      title: "ssr: false",
      code: `const Widget = dynamic(() => import("./w"), { ssr: false });
export default function Page() { return <Widget />; }`,
      question: "curl the page. Is the widget markup there?",
      answer: "No. The server sent a loading hole (or nothing). The widget appears after JS.",
      explain: "ssr: false opts that import out of the server render.",
    },
  ],
};
