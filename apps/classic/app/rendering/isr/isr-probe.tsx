"use client";

import { useState } from "react";
import { Badge, Button } from "@lab/learn-ui/ui";

type Sample = { t: number; cache: string; ts: string };

// Fetches the page once per second (like a stream of visitors) and records the cache state each time.
export function IsrProbe({ path = "/rendering/isr", seconds = 15 }: { path?: string; seconds?: number }) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setSamples([]);
    const start = Date.now();
    for (let i = 0; i < seconds; i++) {
      const r = await fetch(path, { cache: "no-store" });
      const html = await r.text();
      const ts = html.match(/data-ts="([^"]+)"/)?.[1] ?? "?";
      const sample = { t: Math.round((Date.now() - start) / 1000), cache: r.headers.get("x-nextjs-cache") ?? "—", ts };
      setSamples((s) => [...s, sample]);
      await new Promise((res) => setTimeout(res, 1000));
    }
    setRunning(false);
  }

  return (
    <div className="space-y-2">
      <Button onClick={run} disabled={running} variant="outline">
        {running ? "probing..." : `Run ISR probe (${seconds}s)`}
      </Button>
      {samples.length > 0 && (
        <table className="w-full font-mono text-xs">
          <thead className="text-left text-zinc-500">
            <tr>
              <th>t+s</th>
              <th>x-nextjs-cache</th>
              <th>HTML generated at</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s, i) => {
              const changed = i > 0 && s.ts !== samples[i - 1].ts;
              return (
                <tr key={i} className="border-t border-zinc-800">
                  <td>{s.t}</td>
                  <td>
                    <Badge tone={s.cache === "HIT" ? "good" : s.cache === "STALE" ? "warn" : "neutral"}>{s.cache}</Badge>
                  </td>
                  <td className={changed ? "text-emerald-400" : ""}>
                    {s.ts.slice(11, 23)} {changed && "← new HTML"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="text-xs text-zinc-500">Only meaningful in production (`pnpm start:prod`).</p>
    </div>
  );
}
