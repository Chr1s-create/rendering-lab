import type { ReactNode } from "react";
import { Badge, Card } from "../ui/primitives";

/** A titled box inside a demo. `kind` labels where the boxed code runs. */
export function DemoSection({
  title,
  kind,
  children,
  description,
}: {
  title: string;
  kind?: "server" | "client" | "mixed";
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {kind === "server" && <Badge tone="server">runs on server</Badge>}
        {kind === "client" && <Badge tone="client">runs in browser</Badge>}
        {kind === "mixed" && <Badge tone="warn">server + client</Badge>}
      </div>
      {description && <div className="text-sm text-zinc-400 [&_code]:text-zinc-200">{description}</div>}
      {children}
    </Card>
  );
}
