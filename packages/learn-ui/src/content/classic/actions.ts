import type { Lesson } from "../../types";

export const actions: Lesson = {
  id: "actions",
  app: "classic",
  href: "/actions",
  title: "Server Actions & Route Handlers",
  tagline:
    "Server Actions are server functions you call from forms or buttons, and they're integrated with React and the cache. Route Handlers are plain HTTP endpoints for everything else.",
  notes: {
    what:
      "A Server Action is an async function marked 'use server'. Next gives it a hidden POST endpoint and an ID. When a form submits or client code calls it, the browser POSTs the arguments, the function runs on the server, and the response can include a re-rendered RSC payload (after revalidatePath, revalidateTag, or redirect). A Route Handler (app/**/route.ts) exports GET, POST, and other methods using the Web Request and Response APIs. It's your REST or webhook layer.",
    where:
      "Both run only on the server. Server Actions are called from the client through an internal POST to the current page URL with a Next-Action header. Route Handlers are called by anything that speaks HTTP: the browser, a CMS webhook, a mobile app, curl.",
    when:
      "A Server Action runs when the user submits a form or client code calls it. It works before hydration, because a <form action> is a real HTML form (progressive enhancement). A Route Handler runs per request. GET handlers are dynamic by default since Next 15, unless you set export const dynamic = 'force-static'.",
    why:
      "Use Server Actions for mutations triggered from your own React UI: forms, likes, settings. You get typed arguments, no hand-written API, built-in revalidation, pending state with useActionState or useFormStatus, and optimistic UI with useOptimistic. Use Route Handlers for public or 3rd-party APIs, webhooks, non-React clients, file and stream responses, and cacheable GET endpoints.",
    tradeoffs: [
      "+ Actions: no API boilerplate, the forms work without JS, and one round trip returns both the mutation result and the fresh UI",
      "+ Route Handlers: standard HTTP, cacheable GETs, any client, full control over headers and status",
      "- Actions are POST-only and run sequentially per client. They're not for data fetching (use Server Components for that)",
      "- Actions are public endpoints. ALWAYS authenticate, authorize, and validate their input",
      "- Route Handlers called from your own Server Components add a pointless HTTP hop",
    ],
    mistakes: [
      "Treating a Server Action as private because it isn't linked anywhere. Anyone can POST to it, so check auth inside every action",
      "Using Server Actions to READ data in a Client Component. Fetch in a Server Component and pass props, or use a GET Route Handler",
      "Forgetting to revalidate after a mutation, so the UI shows stale data",
      "Returning non-serializable values from an action",
      "Calling redirect() inside try/catch. redirect throws a special error, so call it after the try block",
    ],
    apis: [
      {
        name: "Form + useActionState",
        snippet: `"use server";
export async function addTodo(prev: State, formData: FormData): Promise<State> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Text required" };
  await db.todo.create({ text });
  revalidatePath("/actions");
  return { error: null };
}

// client
const [state, formAction, pending] = useActionState(addTodo, { error: null });
<form action={formAction}><input name="text" /><button disabled={pending}>Add</button></form>`,
      },
      {
        name: "useOptimistic",
        snippet: `const [optimistic, addOptimistic] = useOptimistic(todos, (cur, t: Todo) => [...cur, t]);
async function submit(fd: FormData) {
  addOptimistic({ id: -1, text: String(fd.get("text")), pending: true });
  await addTodo(fd); // when it settles, React drops the optimistic state and shows the real props
}`,
      },
      {
        name: "Route Handler",
        snippet: `// app/api/time/route.ts
export async function GET() { return Response.json({ now: Date.now() }); } // dynamic by default
export const dynamic = "force-static";                                   // opt into caching at build
export async function POST(req: Request) { const body = await req.json(); ... }`,
      },
    ],
  },
  tryThis: [
    "Add a todo. The button shows a pending state, and the list updates after the action runs revalidatePath('/actions').",
    "Submit an empty todo. useActionState returns a validation error from the server.",
    "Check 'simulate failure' and add a todo. It appears instantly (optimistic), then rolls back when the server fails.",
    "Disable JavaScript and submit the plain form. It still works, because <form action={serverAction}> degrades to a real POST and full page reload.",
    "In DevTools > Network, find the action request. It's a POST to /actions with a Next-Action header, and the response is an RSC payload, not JSON.",
    "Call the Route Handlers: /api/time (dynamic) changes on every call. /api/time-static (force-static) was frozen at build.",
  ],
  verify: [
    {
      label: "Route Handlers: dynamic vs static GET",
      cmd: `bash scripts/verify-actions.sh`,
      expect: "/api/time returns a different value on each call. /api/time-static returns the same value every time (from build). POST /api/echo echoes the JSON body.",
    },
    {
      label: "The form works without JS (progressive enhancement)",
      cmd: `# Playwright test 'server action works without JavaScript' in apps/classic/e2e/actions.spec.ts
pnpm e2e:nobuild --grep "without JavaScript"`,
      expect: "The test passes. A todo is added with javaScriptEnabled: false.",
    },
  ],
  flashcards: [
    {
      q: "How does a Server Action get called from the browser?",
      a: "Next assigns the action an ID. The client POSTs to the current URL with a Next-Action header and the serialized arguments (FormData), and the response is an RSC payload that can include the updated UI.",
    },
    {
      q: "Why must every Server Action check auth and validate input?",
      a: "Actions are public HTTP endpoints. Anyone who knows the action ID can call them with any arguments. Hiding the button is not security.",
    },
    {
      q: "useActionState vs useFormStatus vs useOptimistic?",
      a: "useActionState holds the action's returned state plus a pending flag and a wrapped action. useFormStatus reads the pending status of the parent <form> from a child component. useOptimistic shows a temporary state until the async action settles.",
    },
    {
      q: "When pick a Route Handler over a Server Action?",
      a: "For webhooks, public or mobile APIs, non-React consumers, GET endpoints you want cached, streaming or file responses, and when you need custom status codes and headers.",
    },
    {
      q: "Are GET Route Handlers cached by default?",
      a: "Not since Next 15. They're dynamic by default. Opt in with export const dynamic = 'force-static' (or revalidate), or use 'use cache' in apps/modern.",
    },
    {
      q: "What does progressive enhancement mean for Server Actions?",
      a: "<form action={serverAction}> renders as a real HTML form, so it submits and works before the JS loads, or with JS disabled.",
    },
  ],
  mcq: [
    {
      id: "ac-1",
      q: "Which HTTP method do Server Actions use?",
      options: ["GET", "POST", "PUT", "Any"],
      answer: 1,
      explain: "Always POST, which is why actions are meant for mutations, not reads.",
    },
    {
      id: "ac-2",
      q: "Inside an action you call redirect('/done') inside try { } catch { }. What happens?",
      options: ["Redirects", "The catch swallows the redirect (it throws a special error), so no redirect happens", "Build error", "It redirects twice"],
      answer: 1,
      explain: "redirect() and notFound() throw control-flow errors. Call them outside try/catch, or rethrow them.",
    },
    {
      id: "ac-3",
      q: "A Stripe webhook must notify your app. Best choice?",
      options: ["Server Action", "Route Handler POST /api/stripe", "Server Component", "proxy.ts"],
      answer: 1,
      explain: "Third-party callers need a stable HTTP URL with a raw body (for signature verification). That's a Route Handler.",
    },
    {
      id: "ac-4",
      q: "After a Server Action adds a todo, how does the list on the same page update without a full reload?",
      options: [
        "You must call router.refresh() manually",
        "revalidatePath or revalidateTag inside the action makes Next return the fresh RSC payload in the same response",
        "useEffect polling",
        "It doesn't",
      ],
      answer: 1,
      explain: "This single-round-trip mutation-plus-re-render is a key benefit of Server Actions.",
    },
    {
      id: "ac-5",
      q: "What is the right way to read data for a Client Component's initial render?",
      options: [
        "Call a Server Action in useEffect",
        "Fetch in a parent Server Component and pass it as props (or a promise for use())",
        "Use a POST Route Handler",
        "localStorage",
      ],
      answer: 1,
      explain: "Server Components are for reads, and actions are for writes.",
    },
  ],
  predict: [
    {
      id: "ac-p1",
      title: "Optimistic + failure",
      code: `addOptimistic({ text: "Buy milk" });
await addTodo(fd); // server throws`,
      question: "What does the user see over time?",
      answer: "'Buy milk' appears instantly, then disappears when the action settles with an error, and an error message shows if you handle it.",
      explain: "Optimistic state only lasts until the transition finishes. Then React renders the real state (props from the server).",
    },
    {
      id: "ac-p2",
      title: "No JS",
      code: `<form action={addTodo}><input name="text" /><button>Add</button></form>`,
      question: "JS is disabled. What happens on submit?",
      answer: "A normal POST to the page runs the action on the server, and the browser receives a full HTML page with the updated list.",
      explain: "Next renders the form with hidden inputs that identify the action, so it works as a classic HTML form.",
    },
  ],
};
