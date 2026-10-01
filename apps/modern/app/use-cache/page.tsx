import { Suspense } from "react";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp } from "@lab/learn-ui/client";
import { useCache } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";

export const metadata = { title: "use cache" };

async function cachedTime(tag: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("use-cache-fn", tag);
  return getTime(tag);
}

async function CachedComponent() {
  "use cache";
  cacheLife("hours");
  cacheTag("use-cache-component");
  const time = await getTime("use-cache-component");
  return (
    <div className="space-y-2">
      <ServerBadge label="component-level" at={time.servedAt} />
      <RenderTimestamp at={time.servedAt} />
      <p className="font-mono text-xs text-zinc-500">hit #{time.hit}</p>
    </div>
  );
}

async function FunctionLevel() {
  const fn = await cachedTime("use-cache-fn");
  return (
    <div className="space-y-2">
      <ServerBadge label="function" at={fn.servedAt} />
      <RenderTimestamp at={fn.servedAt} />
      <p className="font-mono text-xs text-zinc-500" data-marker="use-cache-fn">
        hit #{fn.hit} · random {fn.random}
      </p>
    </div>
  );
}

async function KeyedUser({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { user = "a" } = await searchParams;
  const keyed = await cachedTime(`use-cache-user-${user}`);
  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-sm">
        <Link className="underline" href="/use-cache?user=a">
          user a
        </Link>
        <Link className="underline" href="/use-cache?user=b">
          user b
        </Link>
      </div>
      <p className="font-mono text-xs text-zinc-500" data-marker="use-cache-user">
        user={user} · hit #{keyed.hit} · {keyed.servedAt}
      </p>
    </div>
  );
}

export default function UseCachePage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  return (
    <LessonLayout lesson={useCache}>
      <DemoSection title="Function-level 'use cache'" kind="server">
        <Suspense fallback={<p>loading function cache…</p>}>
          <FunctionLevel />
        </Suspense>
      </DemoSection>

      <DemoSection
        title="Argument becomes the cache key"
        kind="server"
        description="Each user id is a separate entry. Switching A → B → A does not refetch A. searchParams are dynamic, so this hole is in Suspense."
      >
        <Suspense fallback={<p>reading user…</p>}>
          <KeyedUser searchParams={searchParams} />
        </Suspense>
      </DemoSection>

      <DemoSection title="Component-level 'use cache'" kind="server">
        <Suspense fallback={<p>loading component cache…</p>}>
          <CachedComponent />
        </Suspense>
      </DemoSection>

      <HitCounter filter={["tag=use-cache-fn", "tag=use-cache-component", "tag=use-cache-user"]} />
    </LessonLayout>
  );
}
