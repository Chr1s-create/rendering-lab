import { ServerBadge } from "@lab/learn-ui/server";
import { RecordVisit } from "../nav-log";

export default function StaticRouterPage() {
  const ts = new Date().toISOString();
  return (
    <div className="space-y-2">
      <p className="font-semibold">Static page (○)</p>
      <ServerBadge at={ts} />
      <RecordVisit page="static" serverTs={ts} />
    </div>
  );
}
