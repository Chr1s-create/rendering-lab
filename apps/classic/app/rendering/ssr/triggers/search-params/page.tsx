import { TriggerView } from "../trigger-view";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await searchParams;
  return (
    <TriggerView
      name="searchParams"
      expect="dynamic"
      code={`export default async function Page({ searchParams }) {\n  await searchParams; // unknown until the request arrives\n}`}
    />
  );
}
