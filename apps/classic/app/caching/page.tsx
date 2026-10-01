import Link from "next/link";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp } from "@lab/learn-ui/client";
import { Badge, Button } from "@lab/learn-ui/ui";
import { caching } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";
import { revalidateDataCacheDemo } from "./actions";

export const metadata = { title: "Caching layers" };

// cache() is itself scoped to one request: a fresh counter object per render.
const requestCounters = cache(() => ({ raw: 0, memo: 0 }));

// Simulates a DB call (not fetch), so only React cache() can dedupe it.
async function loadStatsRaw() {
  requestCounters().raw++;
  await new Promise((r) => setTimeout(r, 30));
  return { users: 42 };
}
const loadStatsMemo = cache(async () => {
  requestCounters().memo++;
  await new Promise((r) => setTimeout(r, 30));
  return { users: 42 };
});

async function Widget({ n }: { n: number }) {
  await Promise.all([loadStatsRaw(), loadStatsMemo()]);
  // Same URL + options in the same render -> memoized, 1 upstream hit total.
  const t = await getTime("memo-fetch", { cache: "no-store" });
  return (
    <Badge tone="server">
      widget {n} · fetch hit #{t.hit}
    </Badge>
  );
}

async function Totals() {
  await new Promise((r) => setTimeout(r, 200));
  const c = requestCounters();
  return (
    <div className="space-y-1 text-sm" data-marker="memo-totals" data-raw={c.raw} data-memo={c.memo}>
      <p>
        loadStatsRaw() body ran <strong data-testid="raw-count">{c.raw}</strong>× this request (no cache())
      </p>
      <p>
        loadStatsMemo() body ran <strong data-testid="memo-count">{c.memo}</strong>× this request (React cache())
      </p>
    </div>
  );
}

export default async function CachingPage() {
  await connection(); // dynamic: so we can watch per-request behaviour
  const renderedAt = new Date().toISOString();
  const [cached, fresh] = await Promise.all([
    getTime("data-cache", { cache: "force-cache", next: { tags: ["data-cache-demo"] } }),
    getTime("no-store", { cache: "no-store" }),
  ]);

  return (
    <LessonLayout lesson={caching}>
      <DemoSection
        title="Layer 1: Request Memoization (server, one request)"
        kind="server"
        description="Three widgets each call the same loaders and the same fetch URL."
      >
        <div className="flex flex-wrap gap-2">
          <Widget n={1} />
          <Widget n={2} />
          <Widget n={3} />
        </div>
        <Suspense fallback={<p className="text-sm text-zinc-500">counting…</p>}>
          <Totals />
        </Suspense>
      </DemoSection>

      <DemoSection
        title="Layer 2: Data Cache (server, across requests)"
        kind="server"
        description="This page is dynamic, so it renders on every request. One fetch uses force-cache and the other uses no-store."
      >
        <RenderTimestamp at={renderedAt} label="page rendered at" />
        <table className="w-full font-mono text-xs">
          <tbody>
            <tr>
              <td className="py-1 text-zinc-400">force-cache + tag</td>
              <td data-testid="cached-at" data-value={cached.servedAt}>
                {cached.servedAt} (hit #{cached.hit})
              </td>
            </tr>
            <tr>
              <td className="py-1 text-zinc-400">no-store</td>
              <td data-testid="fresh-at" data-value={fresh.servedAt}>
                {fresh.servedAt} (hit #{fresh.hit})
              </td>
            </tr>
          </tbody>
        </table>
        <form action={revalidateDataCacheDemo}>
          <Button size="sm" variant="outline" type="submit">
            revalidateTag(&apos;data-cache-demo&apos;, {"{ expire: 0 }"})
          </Button>
        </form>
      </DemoSection>

      <DemoSection title="Layer 3: Full Route Cache (server/CDN, HTML + RSC)" kind="server">
        <p className="text-sm">
          Static routes are rendered once and stored.{" "}
          <Link href="/caching/full-route" className="underline">
            Open the full-route demo
          </Link>{" "}
          and use <code>revalidatePath</code> to purge it.
        </p>
      </DemoSection>

      <DemoSection title="Layer 4: Router Cache (browser memory)" kind="client">
        <p className="text-sm">
          <Link href="/caching/router" className="underline">
            Open the router-cache demo
          </Link>{" "}
          and navigate between a static and a dynamic page with <code>&lt;Link&gt;</code>.
        </p>
      </DemoSection>

      <div className="flex flex-wrap items-center gap-2">
        <ServerBadge />
      </div>
      <HitCounter filter={["memo-fetch", "data-cache", "no-store", "full-route", "router-"]} />
    </LessonLayout>
  );
}
