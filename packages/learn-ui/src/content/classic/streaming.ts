import type { Lesson } from "../../types";

export const streaming: Lesson = {
  id: "streaming",
  app: "classic",
  href: "/streaming",
  title: "Streaming & Suspense",
  tagline:
    "Send the page in pieces. The shell and fast parts arrive immediately, and slow parts stream in later over the same HTTP response as their data resolves.",
  notes: {
    what:
      "With streaming SSR, React sends HTML in chunks over a single HTTP response. Every <Suspense> boundary whose children are still waiting on async work first sends its fallback. When the data resolves, React streams the real HTML plus a tiny inline script that swaps it into place. loading.tsx is shorthand for wrapping a route segment's page in <Suspense>.",
    where:
      "Rendering happens on the server, and the chunks are sent over one HTTP response (Transfer-Encoding: chunked). The swap into place is done by small inline scripts in the browser. Client Components inside streamed chunks hydrate as their chunk and JS become available (selective hydration).",
    when:
      "At request time, on dynamic routes. Static routes are fully rendered at build, so there's nothing to stream. The shell flushes as soon as everything outside Suspense boundaries is ready, and each boundary flushes independently when its data resolves.",
    why:
      "Improve TTFB and First Contentful Paint on pages with slow data. Users see the layout and navigation instantly, and one slow widget no longer blocks the whole page. Navigation also feels instant because loading.tsx shows straight away.",
    tradeoffs: [
      "+ Fast TTFB and FCP even with slow data. The page becomes progressively interactive",
      "+ Data stays server-rendered (good for SEO: crawlers wait for the full stream)",
      "- Once the shell is sent, the status code and headers are fixed (a late notFound() or redirect can't change a 200)",
      "- Too many boundaries cause layout shift and a 'popcorn' UI. Design the skeletons carefully",
      "- Some proxies or CDNs buffer responses, which breaks streaming",
    ],
    mistakes: [
      "Awaiting all data in the page component, so nothing can stream. Push the awaits down into components wrapped in Suspense",
      "Sequential awaits that create a server waterfall (A, then B, then C). Start the promises in parallel with Promise.all or separate Suspense children",
      "Placing <Suspense> INSIDE the component that awaits. The boundary must be ABOVE (wrapping) the component that suspends",
      "Expecting loading.tsx to wrap the layout. It wraps only the page and child segments, so a layout that awaits slow data still blocks",
      "Expecting streaming in `next dev` with a buffering proxy, or on a static route",
    ],
    apis: [
      {
        name: "Suspense boundaries",
        snippet: `export default function Page() {
  return (
    <>
      <Header />                                  {/* in the first chunk */}
      <Suspense fallback={<Skeleton />}>
        <SlowRecommendations />                   {/* streams when ready */}
      </Suspense>
    </>
  );
}
async function SlowRecommendations() { const r = await getRecs(); return <List r={r} />; }`,
      },
      {
        name: "loading.tsx (route-level Suspense)",
        snippet: `// app/dashboard/loading.tsx
export default function Loading() { return <Skeleton />; }
// Next renders: <Layout><Suspense fallback={<Loading/>}><Page/></Suspense></Layout>`,
      },
      {
        name: "Parallel instead of waterfall",
        snippet: `// waterfall: 3 x 700ms = 2.1s
const a = await getA(); const b = await getB(); const c = await getC();
// parallel: about 700ms
const [a, b, c] = await Promise.all([getA(), getB(), getC()]);`,
      },
      {
        name: "Stream a promise to a Client Component",
        snippet: `// server: don't await, pass the promise
<Suspense fallback="..."><ClientPart dataPromise={getData()} /></Suspense>
// client:
const data = use(dataPromise);`,
      },
    ],
  },
  tryThis: [
    "Open /streaming and reload. The heading appears instantly, then the sections appear at about 1s, 2s, and 3s. Each one shows the server time at which it finished.",
    "Run `node scripts/stream-timing.mjs /streaming`. It prints when each HTTP chunk arrived and which section was in it.",
    "Open /streaming/waterfall. Compare the sequential and parallel server timings side by side.",
    "Click to /streaming/loading-demo from the sidebar or the link. loading.tsx shows immediately during navigation, because it's the Suspense fallback for the page.",
    "Open /streaming/error-demo. A failing fetch throws, and error.tsx catches it with a 'try again' button that calls reset().",
    "Disable JavaScript and reload /streaming. The content still appears, because the streamed HTML is real HTML (the swap scripts won't run, so the fallbacks stay above the hidden content).",
  ],
  verify: [
    {
      label: "Chunks arrive over time",
      cmd: `node scripts/stream-timing.mjs /streaming`,
      expect: "The first chunk arrives in under 200ms and contains the shell and fallbacks. Later chunks at about 1000, 2000, and 3000ms contain stream-fast, stream-medium, and stream-slow.",
    },
    {
      label: "Waterfall vs parallel",
      cmd: `curl -s localhost:3000/streaming/waterfall | grep -o 'data-duration="[^"]*"'`,
      expect: "sequential about 2100ms and parallel about 700ms.",
    },
  ],
  flashcards: [
    {
      q: "What is streaming SSR?",
      a: "Sending server-rendered HTML in chunks over one response. Suspense fallbacks go first, and real content streams in (with inline swap scripts) as each boundary's data resolves.",
    },
    {
      q: "What does loading.tsx do under the hood?",
      a: "It wraps the segment's page (and its children) in <Suspense fallback={<Loading/>}>. That gives an instant loading state on navigation and a streaming boundary on the first load.",
    },
    {
      q: "Why can't you change the status code after streaming starts?",
      a: "HTTP headers, including the status, are sent with the first chunk. Later notFound() or redirect() calls are handled client-side through the stream, which is why you should call them before the first await that suspends, or outside Suspense.",
    },
    {
      q: "What is selective hydration?",
      a: "React 18+ hydrates Suspense boundaries independently as their HTML and JS arrive, and it prioritises the parts the user interacts with. The page doesn't have to wait for everything.",
    },
    {
      q: "How do you avoid a server-side data waterfall?",
      a: "Start independent requests at the same time (Promise.all), or split them into sibling components each inside its own Suspense, so they fetch in parallel.",
    },
    {
      q: "Is streamed content good for SEO?",
      a: "Yes. It's all in the HTML response, which crawlers read in full. It's different from CSR, where the data never appears in the HTML.",
    },
  ],
  mcq: [
    {
      id: "st-1",
      q: "A page awaits a 3s fetch at the top of the page component, then renders <Suspense> around other parts. What is the TTFB?",
      options: ["About 0s", "About 3s: nothing can flush until the page's own await resolves", "About 1.5s", "It depends on the client"],
      answer: 1,
      explain: "Suspense only helps for work done INSIDE the boundary. Move the slow await into a child component wrapped in Suspense.",
    },
    {
      id: "st-2",
      q: "Where does loading.tsx's boundary sit?",
      options: ["Around the root layout", "Around the segment's page and children, inside its layout", "Around every component", "In the browser only"],
      answer: 1,
      explain: "The layout renders, and the page sits inside <Suspense fallback={<Loading/>}>. So a slow layout is NOT covered by its own loading.tsx.",
    },
    {
      id: "st-3",
      q: "Three independent 700ms fetches written as sequential awaits in one component. Total time?",
      options: ["About 700ms", "About 2100ms", "About 1400ms", "0ms (cached)"],
      answer: 1,
      explain: "Each await blocks the next. Use Promise.all for about 700ms.",
    },
    {
      id: "st-4",
      q: "Does a fully static (○) route stream?",
      options: [
        "Yes, always",
        "Effectively no: its HTML was fully generated at build and is served in one go",
        "Only with loading.tsx",
        "Only on the Edge runtime",
      ],
      answer: 1,
      explain: "Streaming matters at request time. Static HTML is already complete (PPR in apps/modern changes this, with a static shell plus streamed holes).",
    },
    {
      id: "st-5",
      q: "You pass an un-awaited promise from a Server Component to a Client Component. How does the client read it?",
      options: ["await in render", "React's use(promise) inside a Suspense boundary", "useEffect + then()", "You can't pass promises"],
      answer: 1,
      explain: "use() suspends until the promise resolves. The server streams the resolved value when it's ready.",
    },
  ],
  predict: [
    {
      id: "st-p1",
      title: "Order of arrival",
      code: `<h1>Shop</h1>
<Suspense fallback={<p>loading A</p>}><A /></Suspense>  // A awaits 2s
<Suspense fallback={<p>loading B</p>}><B /></Suspense>  // B awaits 1s`,
      question: "In what order do things appear?",
      answer: "'Shop' and both fallbacks at about 0s, then B at about 1s, then A at about 2s.",
      explain: "Boundaries resolve independently. Out-of-order streaming means B doesn't wait for A even though A comes first in the tree.",
    },
    {
      id: "st-p2",
      title: "Nested boundaries",
      code: `<Suspense fallback="outer">
  <Slow1s>
    <Suspense fallback="inner"><Slow3s /></Suspense>
  </Slow1s>
</Suspense>`,
      question: "What's on screen at 0s, 1s, and 3s?",
      answer: "At 0s: 'outer'. At 1s: Slow1s content plus 'inner'. At 3s: everything.",
      explain: "The inner boundary can only show once its parent has resolved. Nesting lets you reveal the page progressively.",
    },
  ],
};
