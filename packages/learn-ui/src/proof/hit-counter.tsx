"use client";

import { useCallback, useEffect, useState } from "react";
import { PUBLIC_MOCK_API_URL } from "../lib";
import { Button, Card, CardTitle } from "../ui/primitives";

type Stats = { startedAt: string; hits: Record<string, number> };

/**
 * Live view of how many times the upstream mock API was actually called.
 * If you reload a page and the number does NOT move, Next.js served from a cache.
 */
export function HitCounter({ filter, title = "Upstream hits (mock-api)" }: { filter?: string[]; title?: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${PUBLIC_MOCK_API_URL}/__stats`, { cache: "no-store" });
      setStats(await r.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 1000);
    return () => clearInterval(t);
  }, [load]);

  const entries = Object.entries(stats?.hits ?? {})
    .filter(([k]) => !filter || filter.some((f) => k.includes(f)))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <Card className="text-sm" data-testid="hit-counter">
      <div className="flex items-center justify-between">
        <CardTitle className="mb-0">{title}</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await fetch(`${PUBLIC_MOCK_API_URL}/__reset`, { method: "POST" });
            load();
          }}
        >
          reset counters
        </Button>
      </div>
      {error && <p className="mt-2 text-red-400">mock-api not reachable on {PUBLIC_MOCK_API_URL}. Run <code>pnpm mock</code>.</p>}
      <table className="mt-2 w-full font-mono text-xs">
        <tbody>
          {entries.length === 0 && (
            <tr>
              <td className="text-zinc-500">no hits yet{filter ? ` for ${filter.join(", ")}` : ""}</td>
            </tr>
          )}
          {entries.map(([k, v]) => (
            <tr key={k} className="border-t border-zinc-800">
              <td className="py-1 text-zinc-400">{k}</td>
              <td className="py-1 text-right text-zinc-100" data-hit-key={k}>
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
