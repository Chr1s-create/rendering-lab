import { headers } from "next/headers";
import { TriggerView } from "../trigger-view";

export default async function Page() {
  await headers();
  return <TriggerView name="headers()" expect="dynamic" code={`import { headers } from "next/headers";\nawait headers();`} />;
}
