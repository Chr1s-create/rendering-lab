import Link from "next/link";
import { Callout, Card, CardTitle, CodeBlock } from "@lab/learn-ui/ui";
import { NAV } from "@/components/sidebar";

export default function Home() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Next.js Rendering Lab</h1>
        <p className="max-w-3xl text-zinc-400">
          Each page is a running experiment. Every page has five tabs: <strong>Demo</strong> (proof badges and live
          counters), <strong>Notes</strong> (what, where, when, why), <strong>Try this</strong>,{" "}
          <strong>Verify</strong> (curl and scripts), and <strong>Interview</strong> (flashcards, scored quizzes,
          predict-the-output).
        </p>
      </header>

      <Callout tone="warn" title="Run in production mode to see caching">
        <code>pnpm build &amp;&amp; pnpm start:prod</code> starts mock-api on :4000, classic on :3000 and modern on
        :3001. <code>pnpm dev</code> is fine for reading notes, but dev mode renders everything per request.
      </Callout>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>How to read the proof badges</CardTitle>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>
              <span className="font-mono text-sky-300">▣ server</span>: HTML produced on the server, with the time and
              process id. A Server Component&apos;s code never reaches the browser.
            </li>
            <li>
              <span className="font-mono text-amber-300">◆ client</span>: a Client Component. Its HTML is{" "}
              <em>also</em> pre-rendered on the server, then it hydrates in the browser.
            </li>
            <li>
              <span className="font-mono">HTML generated at</span>: if it stays the same across reloads, the page is
              static or cached. If it changes on every reload, the page renders per request.
            </li>
            <li>
              <span className="font-mono">Upstream hits</span>: the number of times mock-api was actually called. If
              it doesn&apos;t move, a cache answered.
            </li>
          </ul>
        </Card>
        <Card>
          <CardTitle>Decision flow: which rendering strategy?</CardTitle>
          <CodeBlock
            code={`
Is the content the same for every user?
├─ yes ─ Does it change after deploy?
│        ├─ never/rarely ............ SSG  (static, build time)
│        └─ periodically / on CMS edit ISR  (revalidate N or on-demand)
└─ no ── Personalised per request (cookies, headers, auth)?
         ├─ needs SEO / first paint . SSR  (dynamic render per request)
         │   └─ mix static shell + dynamic holes ... PPR (apps/modern)
         └─ behind login, highly interactive ... CSR inside a static shell
`}
          />
        </Card>
      </section>

      <section>
        <Card>
          <CardTitle>The request lifecycle (App Router)</CardTitle>
          <CodeBlock
            code={`
BUILD (next build)
  - prerender static routes -> HTML + RSC payload stored  (Full Route Cache)
  - fetch(..., {cache:'force-cache'}) results stored       (Data Cache)

REQUEST  browser -> [proxy.ts] -> route
  static route?   serve stored HTML  (x-nextjs-cache: HIT; STALE triggers background regen)
  dynamic route?  render now: Server Components run, fetch() calls happen,
                  React streams HTML; Suspense fallbacks first, then the content

BROWSER
  HTML paints (no JS needed) -> JS loads -> React HYDRATES client components
  <Link> navigation -> fetch RSC payload (not HTML) -> Router Cache in memory
`}
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Roadmap (suggested order)</h2>
        <ol className="grid gap-2 md:grid-cols-2">
          {NAV.slice(1).flatMap((g) =>
            g.items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="block rounded-lg border border-zinc-800 p-3 hover:bg-zinc-900">
                  <span className="text-xs text-zinc-500">{g.group}</span>
                  <p className="font-medium">{i.label}</p>
                </Link>
              </li>
            )),
          )}
        </ol>
      </section>
    </div>
  );
}
