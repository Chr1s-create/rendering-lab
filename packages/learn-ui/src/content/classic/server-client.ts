import type { Lesson } from "../../types";

export const serverClient: Lesson = {
  id: "server-client",
  app: "classic",
  href: "/components/server-vs-client",
  title: "Server Components vs Client Components",
  tagline:
    "Server Components render only on the server and send zero JS. Client Components are pre-rendered on the server too, then hydrate in the browser for interactivity. 'use client' marks the boundary.",
  notes: {
    what:
      "React Server Components (RSC) are components whose code runs only on the server. They can be async, read databases and secrets directly, and their output is sent as a serialized tree, the RSC payload. Client Components are the classic React components (state, effects, event handlers, browser APIs). The 'use client' directive at the top of a file marks a boundary: that module and everything it imports become part of the client bundle.",
    where:
      "Server Components run on the server, at build time (static) or per request (dynamic), and never in the browser. Client Components run on the server for the initial HTML (SSR/SSG), then again in the browser during hydration and for every re-render after that.",
    when:
      "Server Components render whenever the route renders: at build, on request, on revalidation, or during router.refresh() and Server Action re-renders. Client Components render on the server for first load, hydrate after the JS loads, and re-render in the browser on state changes. During client navigation, the browser receives RSC payloads, not HTML.",
    why:
      "Default to Server Components for data fetching, secrets, heavy dependencies (markdown parsers, date libraries), and static content. That code ships zero JS. Use Client Components only for the leaves that need interactivity, state, effects, browser APIs, or context.",
    tradeoffs: [
      "+ Server Components: zero bundle cost, direct backend access, secrets stay safe, no client data waterfall",
      "+ Client Components: interactivity, local state, effects, browser APIs",
      "- Server Components can't use useState, useEffect, onClick, or context. They can't re-render from user input without a server round trip",
      "- Props crossing server to client must be serializable (no plain functions, class instances, or Symbols)",
      "- Marking a high-level component 'use client' drags its whole import tree into the bundle",
    ],
    mistakes: [
      "Putting 'use client' on a layout or page 'just in case', which makes the whole subtree client code",
      "Importing a Server Component INTO a Client Component file. It becomes a Client Component. Pass it as children or props instead",
      "Passing functions (onClick handlers) from Server to Client Components. Only Server Actions ('use server' functions) can cross",
      "Thinking a Client Component can't contain Server Components. It can, through children or other ReactNode props",
      "Leaking secrets: any module imported by a Client Component is bundled. Use `import 'server-only'` to make it a build error",
      "Using context in a Server Component. Create a 'use client' Provider and wrap server children with it",
    ],
    apis: [
      {
        name: "The boundary",
        snippet: `// counter.tsx
"use client";                    // this file + its imports go to the browser
import { useState } from "react";
export function Counter({ start }: { start: number }) { ... }

// page.tsx  (Server Component by default)
import { Counter } from "./counter";
export default async function Page() {
  const n = await db.count();    // server-only work
  return <Counter start={n} />;  // serializable prop crosses the boundary
}`,
      },
      {
        name: "Composition: server children inside a client wrapper",
        snippet: `// collapsible.tsx  "use client"
export function Collapsible({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(!open)}>toggle</button>{open && children}</>;
}

// page.tsx (server)
<Collapsible><ServerOnlyDetails /></Collapsible>  // ServerOnlyDetails stays a Server Component`,
      },
      {
        name: "Guards",
        snippet: `import "server-only";  // importing this module from client code = build error
import "client-only";  // importing from server code = build error`,
      },
      {
        name: "Serializable props (React 19)",
        snippet: `string, number, bigint, boolean, null, undefined, plain objects/arrays,
Date, Map, Set, typed arrays, Promise (resolve with use()), JSX, Server Actions.
NOT: plain functions, class instances, Symbols (unless registered).`,
      },
    ],
  },
  tryThis: [
    "Open DevTools > Sources and search the JS for 'SERVER_ONLY_SECRET_MARKER'. It's not there. Then search for 'CLIENT_BUNDLE_MARKER': it's in the client bundle.",
    "Click the Collapsible. The server child inside it shows a ▣ server badge with the same timestamp as the page, because it was rendered on the server and passed in as children.",
    "Open /components/server-vs-client/serialization?break=1. Passing a function prop throws 'Functions cannot be passed directly to Client Components'. The segment's error.tsx catches it. In production, the message is replaced by a digest.",
    "Look at the 'serializable props' demo. A Date, a Map, and a Promise arrive in the client intact, and the Promise is unwrapped with use().",
    "Experiment: add `import \"@/lib/api\"` (which has 'server-only') to a 'use client' file and run `pnpm build`. You get a build error. Then revert it.",
  ],
  verify: [
    {
      label: "Server code never reaches the browser bundle",
      cmd: `bash scripts/verify-rsc.sh`,
      expect: "SERVER_ONLY_SECRET_MARKER is found in 0 files under .next/static, and CLIENT_BUNDLE_MARKER is found in at least 1 file.",
    },
    {
      label: "Client components are in the HTML too",
      cmd: `curl -s localhost:3000/components/server-vs-client | grep -o 'data-marker="client-counter"'`,
      expect: "The marker prints. The Client Component's initial render is in the server HTML.",
    },
    {
      label: "See the RSC payload",
      cmd: `curl -s -H 'RSC: 1' localhost:3000/components/server-vs-client | head -c 600`,
      expect: "Not HTML: the RSC wire format (lines like 0:[...], with module references such as I[...]). This is what <Link> navigation fetches.",
    },
  ],
  flashcards: [
    {
      q: "What does 'use client' actually do?",
      a: "It declares a module boundary. That file and everything it imports are bundled for the browser and can use state, effects, and events. Components in it are still SSR'd for the first load. It does NOT mean 'only render on the client'.",
    },
    {
      q: "Can a Client Component render a Server Component?",
      a: "Not by importing it, because the import would become client code. It can by receiving it as children or another ReactNode prop from a Server Component parent, which renders it on the server first.",
    },
    {
      q: "What is the RSC payload?",
      a: "A compact serialized description of the rendered Server Component tree. It contains the rendered output, placeholders pointing to Client Component modules plus their props, and Suspense boundaries. React uses it to build and reconcile the DOM, and <Link> navigation fetches it instead of HTML.",
    },
    {
      q: "Why can't you pass onClick={() => ...} from a Server to a Client Component?",
      a: "Props are serialized across the network, and a closure over server memory can't be serialized. Only Server Actions can be passed, as references the client can call over HTTP.",
    },
    {
      q: "How do you use React Context with Server Components?",
      a: "Create a 'use client' Provider component and render it in a server layout around {children}. Server Components can't read context, but the client descendants can.",
    },
    {
      q: "What do the server-only and client-only packages do?",
      a: "They are import guards. Importing a server-only module from client code (or a client-only module from server code) fails the build, which prevents secret leaks and browser-API crashes.",
    },
    {
      q: "Where should the 'use client' boundary go?",
      a: "As low in the tree as possible, on the interactive leaves such as buttons, forms, and widgets, so layouts, pages, and data fetching remain Server Components with zero JS.",
    },
  ],
  mcq: [
    {
      id: "sc-1",
      q: "Which of these can a Server Component do?",
      options: ["useState", "onClick handler", "await db.query() directly", "window.localStorage"],
      answer: 2,
      explain: "Server Components can be async and access backend resources. State, events, and browser APIs need a Client Component.",
    },
    {
      id: "sc-2",
      q: "client-wrapper.tsx has 'use client' and imports ServerThing from './server-thing'. What is ServerThing now?",
      options: [
        "Still a Server Component",
        "A Client Component (part of the client bundle)",
        "A build error, always",
        "It's rendered twice",
      ],
      answer: 1,
      explain: "Everything imported by a 'use client' module becomes client code. Pass ServerThing as children from a server parent instead.",
    },
    {
      id: "sc-3",
      q: "Which prop CANNOT be passed from a Server Component to a Client Component?",
      options: ["A Date", "A Promise", "() => console.log('hi')", "A Server Action"],
      answer: 2,
      explain: "Plain functions aren't serializable. Dates, Promises, Maps, Sets, and Server Actions are supported in React 19.",
    },
    {
      id: "sc-4",
      q: "A Server Component imports a 200KB markdown library. How much of it goes to the browser?",
      options: ["200KB", "About 0KB: only the rendered output is sent", "Half, tree-shaken", "It depends on 'use client'"],
      answer: 1,
      explain: "Server Component code (and its dependencies) never ships to the client. That's a key RSC benefit.",
    },
    {
      id: "sc-5",
      q: "During <Link> client-side navigation to an App Router page, what does the browser fetch?",
      options: ["Full HTML", "The RSC payload for the new route segments", "Only JSON from getServerSideProps", "Nothing; it's all client-rendered"],
      answer: 1,
      explain: "The router fetches the RSC payload (the request carries an RSC header) and merges it into the existing tree, keeping shared layouts' state.",
    },
    {
      id: "sc-6",
      q: "You need a ThemeContext available to many client widgets. Where do you put the provider?",
      options: [
        "In a Server Component with createContext",
        "In a 'use client' ThemeProvider rendered by the root layout around {children}",
        "In proxy.ts",
        "You can't use context in the App Router",
      ],
      answer: 1,
      explain: "Providers are Client Components. Rendering one in a server layout and passing {children} keeps the children server-rendered.",
    },
  ],
  predict: [
    {
      id: "sc-p1",
      title: "Where does console.log print?",
      code: `// page.tsx (no directive)
export default function Page() {
  console.log("A");
  return <Button />;
}
// button.tsx
"use client";
export function Button() {
  console.log("B");
  return <button>hi</button>;
}`,
      question: "On a dynamic first page load, where are A and B logged?",
      answer: "A is logged in the server terminal only. B is logged in the server terminal (SSR) AND in the browser console (hydration).",
      explain: "Client Components render on both sides on first load. Server Components render only on the server.",
    },
    {
      id: "sc-p2",
      title: "Serialization",
      code: `// Server Component
<ClientChart data={rows} format={(n) => n.toFixed(2)} />`,
      question: "What happens?",
      answer: "A runtime error: 'Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with \"use server\"'.",
      explain: "Move the formatter into the client file, or pass a serializable option such as { decimals: 2 }.",
    },
  ],
};
