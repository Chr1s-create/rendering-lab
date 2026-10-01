"use client";

import { useState } from "react";
import { Button, CodeBlock } from "@lab/learn-ui/ui";

export function RouteHandlerPlayground() {
  const [out, setOut] = useState<string>("");

  async function call(label: string, url: string, init?: RequestInit) {
    const r = await fetch(url, { cache: "no-store", ...init });
    setOut(`${label}\nstatus ${r.status} · cache-control: ${r.headers.get("cache-control")}\n${await r.text()}`);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => call("GET /api/time (dynamic)", "/api/time")}>
          GET /api/time
        </Button>
        <Button size="sm" variant="outline" onClick={() => call("GET /api/time-static (force-static)", "/api/time-static")}>
          GET /api/time-static
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            call("POST /api/echo", "/api/echo", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ hello: "route handlers" }),
            })
          }
        >
          POST /api/echo
        </Button>
      </div>
      {out && <CodeBlock code={out} />}
    </div>
  );
}
