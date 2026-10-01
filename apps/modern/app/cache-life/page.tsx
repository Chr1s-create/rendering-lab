import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter } from "@lab/learn-ui/client";
import { cacheLife as cacheLifeLesson } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";

export const metadata = { title: "cacheLife" };

async function CachedRow({
  label,
  tag,
  life,
}: {
  label: string;
  tag: string;
  life: { stale?: number; revalidate?: number; expire?: number };
}) {
  "use cache";
  cacheLife(life);
  cacheTag(`life-${tag}`);
  const time = await getTime(tag);
  return (
    <div className="rounded-md border border-zinc-800 p-3">
      <p className="font-mono text-xs text-zinc-500">{label}</p>
      <ServerBadge at={time.servedAt} />
      <p className="mt-1 font-mono text-xs" data-marker={`life-${tag}`}>
        hit #{time.hit} · {time.servedAt}
      </p>
    </div>
  );
}

export default function CacheLifePage() {
  return (
    <LessonLayout lesson={cacheLifeLesson}>
      <DemoSection
        title="One page, several lifetimes"
        kind="server"
        description="The lab profile is 5s stale / 10s revalidate / 60s expire (also named `lab` in next.config.ts). Wait 12s and reload twice to see it refresh first."
      >
        <Suspense fallback={<p>loading cached rows…</p>}>
          <div className="grid gap-2 md:grid-cols-2">
            <CachedRow label="lab (5/10/60)" tag="life-lab" life={{ stale: 5, revalidate: 10, expire: 60 }} />
            <CachedRow label="minutes-like" tag="life-minutes" life={{ stale: 30, revalidate: 60, expire: 360 }} />
            <CachedRow label="hours-like" tag="life-hours" life={{ stale: 300, revalidate: 3600, expire: 86400 }} />
            <CachedRow
              label="max-like"
              tag="life-max"
              life={{ stale: 300, revalidate: 60 * 60 * 24 * 30, expire: 60 * 60 * 24 * 365 }}
            />
          </div>
        </Suspense>
      </DemoSection>
      <HitCounter filter={["tag=life-"]} />
    </LessonLayout>
  );
}
