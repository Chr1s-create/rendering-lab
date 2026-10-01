"use client";

import { useState } from "react";
import { Button, CodeBlock } from "@lab/learn-ui/ui";

type Result = { name: string; ms: number[]; body: unknown };

export function RuntimeCompare() {
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const out: Result[] = [];
    for (const name of ["node", "edge"]) {
      const ms: number[] = [];
      let body: unknown = null;
      for (let i = 0; i < 5; i++) {
        const t0 = performance.now();
        const r = await fetch(`/api/runtime/${name}`, { cache: "no-store" });
        body = await r.json();
        ms.push(Math.round(performance.now() - t0));
      }
      out.push({ name, ms, body });
    }
    setResults(out);
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <Button onClick={run} disabled={busy} variant="outline">
        {busy ? "calling…" : "call both 5×"}
      </Button>
      <div className="grid gap-3 md:grid-cols-2">
        {results.map((r) => (
          <div key={r.name} className="space-y-1">
            <p className="text-sm font-semibold">
              /api/runtime/{r.name}: <span className="font-mono text-xs">{r.ms.join("ms, ")}ms</span>
            </p>
            <CodeBlock code={JSON.stringify(r.body, null, 2)} />
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        Locally both run in the same <code>next start</code> process, so latency is similar. On a platform, Edge can be
        deployed globally while Node runs in your chosen region.
      </p>
    </div>
  );
}
