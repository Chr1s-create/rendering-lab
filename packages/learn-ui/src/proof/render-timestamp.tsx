"use client";

import { useEffect, useState } from "react";
import { formatTime } from "../lib";

/**
 * Shows a server-produced timestamp and how old it is.
 * Same value on every reload  -> static (build time) or cached.
 * New value on every reload    -> rendered per request (dynamic / SSR).
 */
export function RenderTimestamp({ at, label = "HTML generated at", testId }: { at: string; label?: string; testId?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const age = now === null ? null : Math.max(0, Math.round((now - new Date(at).getTime()) / 1000));
  return (
    <div className="flex flex-wrap items-baseline gap-2 font-mono text-sm">
      <span className="text-zinc-400">{label}</span>
      <span data-testid={testId ?? "render-ts"} data-ts={at} className="text-zinc-100">
        {formatTime(at)}
      </span>
      {age !== null && <span className="text-xs text-zinc-500">({age}s ago)</span>}
    </div>
  );
}
