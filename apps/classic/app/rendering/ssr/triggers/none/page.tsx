import { TriggerView } from "../trigger-view";

// Control group: nothing dynamic -> prerendered at build (○ Static).
export default function Page() {
  return <TriggerView name="none" expect="static" code={`export default function Page() {\n  return <p>{new Date().toISOString()}</p>; // runs once at build\n}`} />;
}
