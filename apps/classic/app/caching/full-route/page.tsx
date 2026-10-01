import Link from "next/link";
import { DemoSection, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp, RequestInfo } from "@lab/learn-ui/client";
import { Button } from "@lab/learn-ui/ui";
import { getTime } from "@/lib/api";
import { revalidateFullRoute } from "../actions";

export const metadata = { title: "Full Route Cache" };

// Static: rendered at build, stored as .next/server/app/caching/full-route.{html,rsc}
export default async function FullRoutePage() {
  const t = await getTime("full-route", { cache: "force-cache", next: { tags: ["full-route"] } });
  return (
    <div className="space-y-4">
      <Link href="/caching" className="text-sm text-zinc-400 underline">
        ← back to Caching
      </Link>
      <h1 className="text-2xl font-bold">Full Route Cache</h1>
      <DemoSection title="Stored HTML + RSC payload" kind="server">
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge />
          <RenderTimestamp at={new Date().toISOString()} />
        </div>
        <p className="font-mono text-xs text-zinc-500">upstream servedAt {t.servedAt}</p>
        <form action={revalidateFullRoute}>
          <Button type="submit" variant="outline" size="sm">
            revalidatePath(&apos;/caching/full-route&apos;)
          </Button>
        </form>
        <p className="text-sm text-zinc-400">
          revalidatePath also invalidates the Data Cache entries used by the route, so after clicking, both the
          render time and the upstream time update.
        </p>
      </DemoSection>
      <RequestInfo />
    </div>
  );
}
