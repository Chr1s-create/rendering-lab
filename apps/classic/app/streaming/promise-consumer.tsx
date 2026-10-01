"use client";

import { use } from "react";
import { ClientBadge } from "@lab/learn-ui/client";

export function PromiseConsumer({ promise }: { promise: Promise<string> }) {
  const servedAt = use(promise);
  return (
    <div className="flex items-center gap-2 text-sm" data-marker="stream-promise">
      <ClientBadge label="use(promise)" /> upstream answered at <code>{servedAt}</code>
    </div>
  );
}
