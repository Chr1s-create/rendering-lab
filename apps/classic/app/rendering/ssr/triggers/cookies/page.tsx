import { cookies } from "next/headers";
import { TriggerView } from "../trigger-view";

export default async function Page() {
  await cookies();
  return <TriggerView name="cookies()" expect="dynamic" code={`import { cookies } from "next/headers";\nawait cookies();`} />;
}
