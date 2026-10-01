import { getTime } from "@/lib/api";
import { TriggerView } from "../trigger-view";

export default async function Page() {
  await getTime("trigger-no-store", { cache: "no-store" });
  return <TriggerView name="fetch no-store" expect="dynamic" code={`await fetch(url, { cache: "no-store" });`} />;
}
