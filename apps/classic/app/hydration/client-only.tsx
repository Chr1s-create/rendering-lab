"use client";

import { ClientBadge } from "@lab/learn-ui/client";

export default function ClientOnlyWidget() {
  return (
    <div data-marker="client-only-widget" data-testid="client-only-widget" className="text-sm">
      <ClientBadge label="ssr: false" />
      <p className="mt-2">
        This module was omitted from the server HTML. You only see it after the JS bundle loads.{" "}
        <code>window.innerWidth = {typeof window !== "undefined" ? window.innerWidth : "?"}</code>
      </p>
    </div>
  );
}
