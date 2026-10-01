import { Suspense } from "react";
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp } from "@lab/learn-ui/client";
import { ppr } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";

export const metadata = { title: "PPR" };

async function CachedPanel() {
  "use cache";
  cacheLife("hours");
  cacheTag("ppr-cached");
  const time = await getTime("ppr-cached");
  return (
    <div data-marker="ppr-cached" className="space-y-2">
      <ServerBadge label="cached" at={time.servedAt} />
      <RenderTimestamp at={time.servedAt} label="cached fetch at" />
      <p className="font-mono text-xs text-zinc-500">
        hit #{time.hit} · random {time.random}
      </p>
    </div>
  );
}

async function DynamicPanel() {
  await connection();
  const time = await getTime("ppr-dynamic");
  return (
    <div data-marker="ppr-dynamic" className="space-y-2">
      <ServerBadge label="dynamic hole" at={time.servedAt} />
      <RenderTimestamp at={time.servedAt} label="request-time fetch at" />
      <p className="font-mono text-xs text-zinc-500">
        hit #{time.hit} · random {time.random}
      </p>
    </div>
  );
}

export default function PprPage() {
  return (
    <LessonLayout lesson={ppr}>
      <DemoSection
        title="Static shell"
        kind="server"
        description="This heading is synchronous. It is in the prerendered shell the CDN can serve instantly."
      >
        <h2 data-marker="ppr-static" className="text-lg font-semibold">
          Partial Prerendering demo
        </h2>
        <p className="text-sm text-zinc-400">View-source: this text is in the first HTML bytes.</p>
      </DemoSection>

      <DemoSection title="Cached section ('use cache')" kind="server">
        <Suspense fallback={<p>loading cached section…</p>}>
          <CachedPanel />
        </Suspense>
      </DemoSection>

      <DemoSection
        title="Dynamic hole (Suspense + connection())"
        kind="server"
        description="The fallback is in the shell. The content streams at request time."
      >
        <Suspense fallback={<p data-fallback="ppr-dynamic">streaming dynamic hole…</p>}>
          <DynamicPanel />
        </Suspense>
      </DemoSection>

      <HitCounter filter={["tag=ppr-cached", "tag=ppr-dynamic"]} />
    </LessonLayout>
  );
}
