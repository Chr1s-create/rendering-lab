"use client";

import { useState } from "react";
import { Badge, Button, Card, CardTitle } from "../ui/primitives";

const INTERESTING_HEADERS = [
  "x-nextjs-cache",
  "x-nextjs-prerender",
  "x-nextjs-postponed",
  "x-nextjs-stale-time",
  "cache-control",
  "x-proxy-seen",
  "x-ab-bucket",
  "vary",
];

/**
 * Re-fetches the current URL as a plain document request (like `curl`) and shows the
 * caching headers Next.js sent. Note: this IS a real request; on SSR pages it triggers a render.
 */
export function RequestInfo({ path }: { path?: string }) {
  const [headers, setHeaders] = useState<[string, string][] | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function inspect() {
    setBusy(true);
    const r = await fetch(path ?? window.location.pathname + window.location.search, { cache: "no-store" });
    setStatus(r.status);
    setHeaders(INTERESTING_HEADERS.map((h) => [h, r.headers.get(h) ?? "—"]));
    setBusy(false);
  }

  return (
    <Card className="text-sm" data-testid="request-info">
      <div className="flex items-center justify-between">
        <CardTitle className="mb-0">Response headers</CardTitle>
        <Button size="sm" variant="outline" onClick={inspect} disabled={busy}>
          {busy ? "fetching..." : "inspect headers"}
        </Button>
      </div>
      {headers && (
        <table className="mt-2 w-full font-mono text-xs">
          <tbody>
            <tr>
              <td className="py-1 text-zinc-400">status</td>
              <td className="py-1 text-right">{status}</td>
            </tr>
            {headers.map(([k, v]) => (
              <tr key={k} className="border-t border-zinc-800">
                <td className="py-1 text-zinc-400">{k}</td>
                <td className="py-1 text-right break-all" data-header={k}>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        Headers like <code>x-nextjs-cache</code> only appear in production (<code>next start</code>), not in{" "}
        <code>next dev</code>.
      </p>
    </Card>
  );
}

/**
 * Answers "was this data in the initial HTML?" (SSR/SSG) or "was it rendered by browser JS?" (CSR).
 * It looks for the literal attribute data-marker="<marker>" in the raw HTML.
 */
export function ViewSourceCheck({ marker, path }: { marker: string; path?: string }) {
  const [result, setResult] = useState<null | boolean>(null);
  const [snippet, setSnippet] = useState("");

  async function check() {
    const r = await fetch(path ?? window.location.pathname + window.location.search, { cache: "no-store" });
    const html = await r.text();
    const needle = `data-marker="${marker}"`;
    const idx = html.indexOf(needle);
    setResult(idx >= 0);
    setSnippet(idx >= 0 ? html.slice(Math.max(0, idx - 40), idx + 160) : "");
  }

  return (
    <Card className="text-sm" data-testid="view-source-check">
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="mb-0">View-source check</CardTitle>
        <Button size="sm" variant="outline" onClick={check}>
          check raw HTML
        </Button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Looks for <code>data-marker=&quot;{marker}&quot;</code> in the HTML the server sent (what crawlers and
        no-JS users see).
      </p>
      {result !== null && (
        <div className="mt-2 space-y-2">
          {result ? (
            <Badge tone="good" data-testid="vsc-result">in initial HTML (server-rendered)</Badge>
          ) : (
            <Badge tone="bad" data-testid="vsc-result">NOT in initial HTML (rendered by browser JS)</Badge>
          )}
          {snippet && <pre className="whitespace-pre-wrap break-all">{snippet}…</pre>}
        </div>
      )}
    </Card>
  );
}
