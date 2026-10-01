import Link from "next/link";
import { notFound } from "next/navigation";
import { ServerBadge } from "@lab/learn-ui/server";
import { Callout } from "@lab/learn-ui/ui";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ bucket: "a" }, { bucket: "b" }];
}

// Both variants are STATIC pages. proxy.ts chooses which one to serve for /runtime/ab.
export default async function Variant({ params }: { params: Promise<{ bucket: string }> }) {
  const { bucket } = await params;
  if (bucket !== "a" && bucket !== "b") notFound();
  return (
    <div className="space-y-4">
      <Link href="/runtime" className="text-sm text-zinc-400 underline">
        ← back to Runtime
      </Link>
      <h1 className="text-3xl font-bold" data-marker={`variant-${bucket}`}>
        Variant {bucket.toUpperCase()}
      </h1>
      <ServerBadge label="static variant" />
      <Callout tone={bucket === "a" ? "info" : "tip"} title="Rewrite + sticky cookie">
        The URL bar still says <code>/runtime/ab</code>. Your <code>ab-bucket</code> cookie is <code>{bucket}</code>,
        so you&apos;ll keep seeing this variant. Delete the cookie to be re-bucketed.
      </Callout>
    </div>
  );
}
