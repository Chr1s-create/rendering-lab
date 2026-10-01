"use client";

import Link from "next/link";
import { Callout } from "@lab/learn-ui/ui";

// error.tsx must be a Client Component: it is a React error boundary for this route segment.
export default function SerializationError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="space-y-3" data-testid="serialization-error">
      <h1 className="text-2xl font-bold">Caught by error.tsx</h1>
      <Callout tone="warn" title="The server render threw">
        <p className="font-mono text-xs break-all">{error.message}</p>
        {error.digest && (
          <p className="mt-2 text-xs">
            digest: <code>{error.digest}</code>. In production, server error messages are hidden from the browser
            and only the digest is sent. Look for the full error in the server logs.
          </p>
        )}
      </Callout>
      <Link href="/components/server-vs-client/serialization" className="underline">
        Remove ?break=1
      </Link>
    </div>
  );
}
