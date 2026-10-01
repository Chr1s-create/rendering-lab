import Link from "next/link";
import { ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp, RequestInfo } from "@lab/learn-ui/client";
import { CodeBlock } from "@lab/learn-ui/ui";

export function TriggerView({ name, code, expect }: { name: string; code: string; expect: "static" | "dynamic" }) {
  return (
    <div className="space-y-4">
      <Link href="/rendering/ssr" className="text-sm text-zinc-400 underline">
        ← back to SSR lesson
      </Link>
      <h1 className="text-2xl font-bold">
        Trigger: <code>{name}</code>
      </h1>
      <p className="text-zinc-400">
        Expected: <strong data-testid="expected">{expect}</strong>. Reload a few times. A{" "}
        {expect === "static" ? "frozen" : "changing"} timestamp proves it.
      </p>
      <CodeBlock code={code} />
      <div className="flex flex-wrap items-center gap-3">
        <ServerBadge />
        <RenderTimestamp at={new Date().toISOString()} />
      </div>
      <RequestInfo />
    </div>
  );
}
