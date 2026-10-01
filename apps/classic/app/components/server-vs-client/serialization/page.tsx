import Link from "next/link";
import { Callout, CodeBlock } from "@lab/learn-ui/ui";
import { NeedsFunction } from "../client-parts";

export default async function SerializationPage({ searchParams }: { searchParams: Promise<{ break?: string }> }) {
  const { break: shouldBreak } = await searchParams;
  return (
    <div className="space-y-4">
      <Link href="/components/server-vs-client" className="text-sm text-zinc-400 underline">
        ← back
      </Link>
      <h1 className="text-2xl font-bold">Serialization boundary</h1>
      <CodeBlock code={`// Server Component\n<NeedsFunction format={(n) => n.toFixed(2)} />  // function prop -> error`} />
      {shouldBreak === "1" ? (
        <NeedsFunction format={(n) => n.toFixed(2)} />
      ) : (
        <Callout tone="info" title="Not broken yet">
          <Link className="underline" href="?break=1">
            Add ?break=1
          </Link>{" "}
          to pass a function prop and trigger the error boundary in <code>error.tsx</code>.
        </Callout>
      )}
    </div>
  );
}
