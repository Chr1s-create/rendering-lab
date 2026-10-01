import { connection } from "next/server";
import { TriggerView } from "../trigger-view";

export default async function Page() {
  // "Wait for a real request" without reading any request data.
  await connection();
  return <TriggerView name="connection()" expect="dynamic" code={`import { connection } from "next/server";\nawait connection();`} />;
}
