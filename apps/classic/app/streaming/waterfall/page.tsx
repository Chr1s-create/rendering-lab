import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { DemoSection } from "@lab/learn-ui/server";
import { CodeBlock } from "@lab/learn-ui/ui";
import { getTime } from "@/lib/api";

export const metadata = { title: "Waterfall vs parallel" };

const DELAY = 700;

async function Sequential() {
  const t0 = Date.now();
  await getTime("wf-a", { cache: "no-store" }, DELAY);
  await getTime("wf-b", { cache: "no-store" }, DELAY);
  await getTime("wf-c", { cache: "no-store" }, DELAY);
  const ms = Date.now() - t0;
  return (
    <p className="text-sm" data-duration={`sequential:${ms}`}>
      sequential: <strong>{ms}ms</strong>
    </p>
  );
}

async function Parallel() {
  const t0 = Date.now();
  await Promise.all([
    getTime("pl-a", { cache: "no-store" }, DELAY),
    getTime("pl-b", { cache: "no-store" }, DELAY),
    getTime("pl-c", { cache: "no-store" }, DELAY),
  ]);
  const ms = Date.now() - t0;
  return (
    <p className="text-sm" data-duration={`parallel:${ms}`}>
      parallel: <strong>{ms}ms</strong>
    </p>
  );
}

export default async function WaterfallPage() {
  await connection();
  return (
    <div className="space-y-4">
      <Link href="/streaming" className="text-sm text-zinc-400 underline">
        ← back to Streaming
      </Link>
      <h1 className="text-2xl font-bold">Server waterfall vs parallel</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <DemoSection title="Sequential awaits" kind="server">
          <CodeBlock code={`await getA(); // ${DELAY}ms\nawait getB(); // ${DELAY}ms\nawait getC(); // ${DELAY}ms`} />
          <Suspense fallback={<p className="text-sm text-zinc-500">running…</p>}>
            <Sequential />
          </Suspense>
        </DemoSection>
        <DemoSection title="Promise.all" kind="server">
          <CodeBlock code={`await Promise.all([getA(), getB(), getC()]);`} />
          <Suspense fallback={<p className="text-sm text-zinc-500">running…</p>}>
            <Parallel />
          </Suspense>
        </DemoSection>
      </div>
      <p className="text-sm text-zinc-400">
        Both boxes stream independently, so the parallel result shows up first even though it&apos;s second in the
        tree.
      </p>
    </div>
  );
}
