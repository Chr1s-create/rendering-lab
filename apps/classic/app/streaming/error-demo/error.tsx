"use client";

import Link from "next/link";
import { Button, Callout } from "@lab/learn-ui/ui";

export default function ErrorDemo({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="space-y-3" data-testid="error-boundary">
      <Link href="/streaming" className="text-sm text-zinc-400 underline">
        ← back to Streaming
      </Link>
      <h1 className="text-2xl font-bold">error.tsx caught a server error</h1>
      <Callout tone="warn" title="Segment error boundary">
        <p>
          The layout and sidebar are still interactive. Only this segment was replaced. In production the message is
          generic and you get a digest: <code>{error.digest ?? "(dev shows the full message)"}</code>
        </p>
        <p className="mt-1 font-mono text-xs">{error.message}</p>
      </Callout>
      <div className="flex gap-2">
        {/* reset() re-renders the segment on the client; for a server error you usually also refresh. */}
        <Button onClick={() => reset()}>try again (reset)</Button>
        <Link href="/streaming/error-demo?ok=1" className="underline">
          load with ?ok=1
        </Link>
      </div>
    </div>
  );
}
