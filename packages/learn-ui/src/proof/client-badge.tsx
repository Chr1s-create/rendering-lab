"use client";

import { useEffect, useState } from "react";
import { Badge } from "../ui/primitives";
import { formatTime } from "../lib";

/**
 * Proof that a piece of UI is a CLIENT component.
 * Key lesson: client components are ALSO pre-rendered to HTML on the server.
 * Before hydration it shows "html only"; after hydration it shows when JS took over.
 */
export function ClientBadge({ label = "client" }: { label?: string }) {
  const [hydratedAt, setHydratedAt] = useState<string | null>(null);
  useEffect(() => setHydratedAt(new Date().toISOString()), []);
  return (
    <Badge tone="client" data-proof="client-badge" data-hydrated={hydratedAt ? "yes" : "no"}>
      <span aria-hidden>◆</span> {label} ·{" "}
      {hydratedAt ? `hydrated ${formatTime(hydratedAt)}` : "html only (not hydrated yet)"}
    </Badge>
  );
}
