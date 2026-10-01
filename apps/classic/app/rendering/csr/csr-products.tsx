"use client";

import { useCallback, useEffect, useState } from "react";
import { ClientBadge } from "@lab/learn-ui/client";
import { PUBLIC_MOCK_API_URL, formatTime } from "@lab/learn-ui/lib";
import { Button } from "@lab/learn-ui/ui";

type Product = { id: string; name: string; price: number };
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; products: Product[]; servedAt: string; hit: number };

function useProducts(url: string, refetchOnFocus: boolean) {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(
    (signal?: AbortSignal) => {
      fetch(url, { signal, cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((d) => setState({ status: "ok", products: d.products, servedAt: d.servedAt, hit: d.hit }))
        .catch((e: Error) => {
          if (e.name !== "AbortError") setState({ status: "error", message: e.message });
        });
    },
    [url],
  );

  useEffect(() => {
    // Effects never run on the server: this fetch happens only in the browser, after hydration.
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  useEffect(() => {
    if (!refetchOnFocus) return;
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load, refetchOnFocus]);

  return { state, reload: () => load() };
}

function ProductList({ state, marker }: { state: State; marker: string }) {
  if (state.status === "loading")
    return (
      <div data-marker="csr-skeleton" className="space-y-2" aria-busy>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-5 w-64 animate-pulse rounded bg-zinc-800" />
        ))}
      </div>
    );
  if (state.status === "error") return <p className="text-sm text-red-400">Error: {state.message}</p>;
  return (
    <div data-marker={marker} data-testid={marker}>
      <ul className="list-disc pl-5 text-sm">
        {state.products.map((p) => (
          <li key={p.id}>
            {p.name}: ${p.price}
          </li>
        ))}
      </ul>
      <p className="mt-1 font-mono text-xs text-zinc-500">
        fetched by browser at {formatTime(state.servedAt)} · upstream hit #{state.hit}
      </p>
    </div>
  );
}

export function CsrProducts() {
  const [focus, setFocus] = useState(false);
  const { state, reload } = useProducts(`${PUBLIC_MOCK_API_URL}/products?tag=csr&delay=600`, focus);
  return (
    <div className="space-y-3">
      <ClientBadge />
      <ProductList state={state} marker="csr-data" />
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={reload}>
          refetch
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={focus} onChange={(e) => setFocus(e.target.checked)} /> refetch on window focus
        </label>
      </div>
    </div>
  );
}

export function BffProducts() {
  const { state, reload } = useProducts("/api/products", false);
  return (
    <div className="space-y-3">
      <ClientBadge />
      <ProductList state={state} marker="bff-data" />
      <Button size="sm" variant="outline" onClick={reload}>
        refetch
      </Button>
    </div>
  );
}
