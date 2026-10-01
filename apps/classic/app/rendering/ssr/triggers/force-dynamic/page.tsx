import { TriggerView } from "../trigger-view";

export const dynamic = "force-dynamic";

export default function Page() {
  return <TriggerView name="dynamic = 'force-dynamic'" expect="dynamic" code={`export const dynamic = "force-dynamic";`} />;
}
