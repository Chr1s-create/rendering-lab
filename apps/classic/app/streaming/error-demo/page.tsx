import Link from "next/link";
import { connection } from "next/server";
import { API } from "@/lib/api";

export const metadata = { title: "error.tsx demo" };

export default async function ErrorDemoPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await connection();
  const { ok } = await searchParams;
  if (!ok) {
    const r = await fetch(`${API}/slow-fail?delay=500`, { cache: "no-store" });
    if (!r.ok) throw new Error(`Upstream failed with ${r.status} (thrown in a Server Component)`);
  }
  return (
    <div className="space-y-3">
      <Link href="/streaming" className="text-sm text-zinc-400 underline">
        ← back to Streaming
      </Link>
      <h1 className="text-2xl font-bold">No error this time</h1>
      <p className="text-sm">
        You added <code>?ok=1</code>, so the failing fetch was skipped.
      </p>
    </div>
  );
}
