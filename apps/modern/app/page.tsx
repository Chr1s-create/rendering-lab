import Link from "next/link";
import { Callout, Card, CardTitle, CodeBlock } from "@lab/learn-ui/ui";
import { NAV } from "@/components/sidebar";

export default function Home() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cache Components (Next.js 16)</h1>
        <p className="max-w-3xl text-zinc-400">
          This app runs with <code>cacheComponents: true</code>. In this model, content isn&apos;t either
          &quot;static page&quot; or &quot;dynamic page&quot;. Each part of a route is one of three kinds:{" "}
          <strong>static</strong>, <strong>cached</strong> (<code>&apos;use cache&apos;</code>), or{" "}
          <strong>dynamic</strong> (inside <code>&lt;Suspense&gt;</code>). The static and cached parts are prerendered
          into a shell, and the dynamic holes stream in at request time. That is Partial Prerendering.
        </p>
      </header>

      <Callout tone="info" title="Why a separate app?">
        With <code>cacheComponents</code> on, route segment config such as <code>export const revalidate</code> and{" "}
        <code>export const dynamic</code> is not allowed. The classic app (:3000) keeps those APIs working so you can
        learn both models side by side.
      </Callout>

      <Card>
        <CardTitle>The three kinds of content</CardTitle>
        <CodeBlock
          code={`
export default function Page() {
  return (
    <>
      <h1>Static</h1>                       {/* sync, no data: in the prerendered shell */}
      <CachedStats />                        {/* 'use cache': computed at build, in the shell */}
      <Suspense fallback={<Skeleton />}>     {/* fallback is in the shell...                */}
        <PerUserThing />                     {/* ...content streams at request time         */}
      </Suspense>
    </>
  );
}

async function CachedStats() { 'use cache'; cacheLife('hours'); return <p>{await db.stats()}</p>; }
async function PerUserThing() { const c = await cookies(); return <p>Hi {c.get('name')?.value}</p>; }
`}
        />
        <p className="mt-2 text-sm text-zinc-400">
          If you read dynamic data (<code>cookies()</code>, <code>headers()</code>, uncached <code>fetch</code>,{" "}
          <code>connection()</code>) outside <code>&lt;Suspense&gt;</code> and outside <code>&apos;use cache&apos;</code>,{" "}
          <code>next build</code> fails with an &quot;Uncached data was accessed outside of &lt;Suspense&gt;&quot;
          error. This is intentional: Next makes you choose cached or streamed for every piece of data.
        </p>
      </Card>

      <ol className="grid gap-2 md:grid-cols-2">
        {NAV.slice(1).map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="block rounded-lg border border-zinc-800 p-3 hover:bg-zinc-900">
              {i.label}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
