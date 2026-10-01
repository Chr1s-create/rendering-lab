import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { streaming } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";
import { PromiseConsumer } from "./promise-consumer";

export const metadata = { title: "Streaming" };

function Skeleton({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500" data-fallback={label}>
      <span className="h-3 w-3 animate-pulse rounded-full bg-zinc-600" /> streaming {label}…
    </div>
  );
}

async function Section({ name, delay, start }: { name: string; delay: number; start: number }) {
  const t = await getTime(`stream-${name}`, { cache: "no-store" }, delay);
  const elapsed = Date.now() - start;
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm" data-marker={`stream-${name}`}>
      <ServerBadge label={name} />
      <span>
        finished on server at <strong>+{elapsed}ms</strong> after the request started (upstream delay {delay}ms, hit #
        {t.hit})
      </span>
    </div>
  );
}

export default async function StreamingPage() {
  // Streaming happens at request time, so make the route explicitly dynamic.
  await connection();
  const start = Date.now();
  // Not awaited: the promise is passed to a Client Component and resolved there with use().
  const promise = getTime("stream-promise", { cache: "no-store" }, 1500).then((t) => t.servedAt);

  return (
    <LessonLayout lesson={streaming}>
      <DemoSection
        title="1. Independent boundaries stream out of order"
        kind="server"
        description="The shell (this text) is in the first chunk. Each section below sits in its own <Suspense>."
      >
        <ServerBadge label="shell flushed" />
        <div className="space-y-2">
          <Suspense fallback={<Skeleton label="slow (3s)" />}>
            <Section name="slow" delay={3000} start={start} />
          </Suspense>
          <Suspense fallback={<Skeleton label="fast (1s)" />}>
            <Section name="fast" delay={1000} start={start} />
          </Suspense>
          <Suspense fallback={<Skeleton label="medium (2s)" />}>
            <Section name="medium" delay={2000} start={start} />
          </Suspense>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Nested boundaries reveal progressively"
        kind="server"
        description="The inner boundary can only show after its parent has resolved."
      >
        <Suspense fallback={<Skeleton label="outer (1s)" />}>
          <Outer start={start} />
        </Suspense>
      </DemoSection>

      <DemoSection
        title="3. Stream a promise into a Client Component"
        kind="mixed"
        description={
          <>
            The server starts the fetch but doesn&apos;t await it. The Client Component calls <code>use(promise)</code>.
          </>
        }
      >
        <Suspense fallback={<Skeleton label="promise (1.5s)" />}>
          <PromiseConsumer promise={promise} />
        </Suspense>
      </DemoSection>

      <DemoSection title="4. More experiments" kind="server">
        <ul className="list-disc pl-5 text-sm">
          <li>
            <Link className="underline" href="/streaming/waterfall">
              Waterfall vs parallel fetching
            </Link>
          </li>
          <li>
            <Link className="underline" href="/streaming/loading-demo">
              loading.tsx on navigation
            </Link>
          </li>
          <li>
            <Link className="underline" href="/streaming/error-demo">
              error.tsx with reset()
            </Link>
          </li>
        </ul>
      </DemoSection>
    </LessonLayout>
  );
}

async function Outer({ start }: { start: number }) {
  await getTime("stream-outer", { cache: "no-store" }, 1000);
  return (
    <div className="space-y-2 rounded-md border border-zinc-800 p-3">
      <p className="text-sm">outer resolved at +{Date.now() - start}ms</p>
      <Suspense fallback={<Skeleton label="inner (+1.5s)" />}>
        <Section name="inner" delay={1500} start={start} />
      </Suspense>
    </div>
  );
}
