import Link from "next/link";
import { ServerBadge } from "@lab/learn-ui/server";
import { getTime } from "@/lib/api";

export const metadata = { title: "loading.tsx demo" };

// The whole page awaits 2s. loading.tsx (a sibling file) is shown instantly meanwhile.
export default async function LoadingDemoPage() {
  const t = await getTime("loading-demo", { cache: "no-store" }, 2000);
  return (
    <div className="space-y-4" data-marker="loading-demo-content">
      <Link href="/streaming" className="text-sm text-zinc-400 underline">
        ← back to Streaming
      </Link>
      <h1 className="text-2xl font-bold">Page content arrived</h1>
      <ServerBadge />
      <p className="text-sm">
        Upstream answered at <code>{t.servedAt}</code> after 2s. Until then you saw <code>loading.tsx</code>.
      </p>
    </div>
  );
}
