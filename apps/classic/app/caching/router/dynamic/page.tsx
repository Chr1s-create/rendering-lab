import { connection } from "next/server";
import { ServerBadge } from "@lab/learn-ui/server";
import { RecordVisit } from "../nav-log";

export default async function DynamicRouterPage() {
  await connection();
  const ts = new Date().toISOString();
  return (
    <div className="space-y-2">
      <p className="font-semibold">Dynamic page (ƒ)</p>
      <ServerBadge at={ts} />
      <RecordVisit page="dynamic" serverTs={ts} />
    </div>
  );
}
