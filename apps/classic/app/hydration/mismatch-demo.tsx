"use client";

import { useEffect, useState } from "react";
import { ClientBadge } from "@lab/learn-ui/client";
import { Button } from "@lab/learn-ui/ui";

export function MismatchDemo() {
  const [unsafe, setUnsafe] = useState(false);
  return (
    <div className="space-y-2">
      <ClientBadge label="mismatch playground" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={unsafe} onChange={(e) => setUnsafe(e.target.checked)} />
        render Date.now() without a guard (reload after enabling to see the warning)
      </label>
      <p className="font-mono text-sm" data-testid="mismatch-value">
        {unsafe ? `unsafe now: ${Date.now()}` : "safe: no unstable value during render"}
      </p>
      <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
        full reload
      </Button>
    </div>
  );
}

export function SuppressedTime() {
  return (
    <p className="text-sm">
      Server and client times may differ. React is told to ignore this one text node:{" "}
      <time suppressHydrationWarning data-testid="suppressed-time">
        {new Date().toISOString()}
      </time>
    </p>
  );
}

export function MountedGuard() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    setLabel(new Date().toLocaleString());
  }, []);
  return (
    <p className="text-sm" data-marker="mounted-guard" data-testid="mounted-guard">
      locale time: <span className="font-mono">{label ?? "—"}</span>
    </p>
  );
}
