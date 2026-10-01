import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp, RequestInfo } from "@lab/learn-ui/client";
import { Button, CodeBlock } from "@lab/learn-ui/ui";
import { isr } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";
import { expireTagNow, revalidateIsrPath, revalidateIsrTag } from "./actions";
import { IsrProbe } from "./isr-probe";

export const metadata = { title: "ISR" };

// Route-level: cached HTML is fresh for 10s, then regenerated in the background on the next request.
export const revalidate = 10;

export default async function IsrPage() {
  const time = await getTime("isr", { next: { revalidate: 10, tags: ["isr-time"] } });
  const renderedAt = new Date().toISOString();

  return (
    <LessonLayout lesson={isr}>
      <DemoSection
        title="1. Static, but regenerated at most every 10s"
        kind="server"
        description={
          <>
            <code>export const revalidate = 10</code>. Reload quickly and the timestamp stays the same. After 10s, the
            first reload is STALE and the next one shows the new HTML.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge label="regenerated on server" />
          <RenderTimestamp at={renderedAt} />
        </div>
        <p className="font-mono text-xs text-zinc-500" data-marker="isr-data">
          mock-api /time?tag=isr hit #{time.hit} at {time.servedAt}
        </p>
      </DemoSection>

      <DemoSection title="2. On-demand revalidation" kind="server" description="Each button calls a Server Action.">
        <div className="flex flex-wrap gap-2">
          <form action={revalidateIsrPath}>
            <Button type="submit" variant="outline">
              revalidatePath(&apos;/rendering/isr&apos;)
            </Button>
          </form>
          <form action={revalidateIsrTag}>
            <Button type="submit" variant="outline">
              revalidateTag(&apos;isr-time&apos;, &apos;max&apos;)
            </Button>
          </form>
          <form action={expireTagNow}>
            <Button type="submit" variant="outline">
              revalidateTag(&apos;isr-time&apos;, {"{ expire: 0 }"})
            </Button>
          </form>
        </div>
        <CodeBlock
          code={`# webhook style (e.g. from a CMS):
curl -X POST 'localhost:3000/api/revalidate?tag=isr-time' -H 'x-lab-secret: lab'
curl -X POST 'localhost:3000/api/revalidate?path=/rendering/isr' -H 'x-lab-secret: lab'`}
        />
      </DemoSection>

      <DemoSection title="3. Watch the stale-while-revalidate cycle" kind="client">
        <IsrProbe />
      </DemoSection>

      <div className="grid gap-4 md:grid-cols-2">
        <HitCounter filter={["tag=isr"]} />
        <RequestInfo />
      </div>
    </LessonLayout>
  );
}
