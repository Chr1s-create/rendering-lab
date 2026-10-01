"use client";

import { createContext, Suspense, use, useContext, useState, type ReactNode } from "react";
import { ClientBadge } from "@lab/learn-ui/client";
import { Badge, Button } from "@lab/learn-ui/ui";

// Ships to the browser. verify-rsc.sh finds this string in .next/static.
const CLIENT_MARKER = "CLIENT_BUNDLE_MARKER";

export function Counter({ start }: { start: number }) {
  const [n, setN] = useState(start);
  return (
    <div className="flex items-center gap-2" data-marker="client-counter" data-bundle={CLIENT_MARKER}>
      <ClientBadge label="Counter" />
      <Button size="sm" onClick={() => setN((x) => x + 1)}>
        count: {n}
      </Button>
      <span className="text-xs text-zinc-500">(start = server CPU count)</span>
    </div>
  );
}

export function Collapsible({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ClientBadge label="Collapsible" />
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : label}
        </Button>
      </div>
      {open && children}
    </div>
  );
}

function PromiseValue({ promise }: { promise: Promise<string> }) {
  const value = use(promise);
  return <code>{value}</code>;
}

export function PropsInspector({ date, map, promise }: { date: Date; map: Map<string, string>; promise: Promise<string> }) {
  return (
    <ul className="space-y-1 text-sm">
      <li>
        <Badge tone="good">Date</Badge> instanceof Date = <code>{String(date instanceof Date)}</code> ·{" "}
        <code>{date.toISOString()}</code>
      </li>
      <li>
        <Badge tone="good">Map</Badge> instanceof Map = <code>{String(map instanceof Map)}</code> · size{" "}
        <code>{map.size}</code> · ssr → <code>{map.get("ssr")}</code>
      </li>
      <li>
        <Badge tone="good">Promise</Badge> unwrapped with <code>use()</code>:{" "}
        <Suspense fallback={<code>pending…</code>}>
          <PromiseValue promise={promise} />
        </Suspense>
      </li>
      <li>
        <Badge tone="bad">Function</Badge> <code>{"onClick={() => ...}"}</code> from a server file is not
        serializable. Only Server Actions can cross.
      </li>
    </ul>
  );
}

const ThemeContext = createContext<{ theme: "sky" | "amber"; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"sky" | "amber">("sky");
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => (t === "sky" ? "amber" : "sky")) }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

export function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  return (
    <Button size="sm" variant="outline" onClick={toggle}>
      theme: {theme} (toggle)
    </Button>
  );
}

export function ThemedBox() {
  const { theme } = useTheme();
  return (
    <div className={theme === "sky" ? "rounded-md bg-sky-900 p-3 text-sm" : "rounded-md bg-amber-900 p-3 text-sm"}>
      Context value read in a Client Component: <strong>{theme}</strong>
    </div>
  );
}

export function NeedsFunction({ format }: { format: (n: number) => string }) {
  return <p>{format(Math.PI)}</p>;
}
