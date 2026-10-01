"use client";

import Link from "next/link";
import { useState } from "react";
import { ClientBadge, ViewSourceCheck } from "@lab/learn-ui/client";
import { Button, Callout } from "@lab/learn-ui/ui";

// The whole page is a Client Component. It is STILL prerendered to HTML at build time.
export default function ClientPage() {
  const [count, setCount] = useState(0);
  return (
    <div className="space-y-4">
      <Link href="/rendering/csr" className="text-sm text-zinc-400 underline">
        ← back to CSR lesson
      </Link>
      <h1 className="text-2xl font-bold">A &apos;use client&apos; page</h1>
      <ClientBadge label="client page" />
      <p data-marker="client-page-html">
        This paragraph is in the server HTML even though the file starts with <code>&apos;use client&apos;</code>.
      </p>
      <Button onClick={() => setCount((c) => c + 1)}>clicked {count} times</Button>
      <Callout tone="tip" title="Takeaway">
        &apos;use client&apos; means &quot;this component and its imports are sent to the browser and hydrate&quot;.
        It does not mean &quot;skip the server&quot;. The initial state (0) is rendered on the server.
      </Callout>
      <ViewSourceCheck marker="client-page-html" />
    </div>
  );
}
