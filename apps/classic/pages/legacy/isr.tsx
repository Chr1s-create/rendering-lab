import Link from "next/link";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp } from "@lab/learn-ui/client";
import { pagesRouter } from "@lab/learn-ui/content";
import { fetchTime, type TimeResp } from "@/lib/pages-api";

export async function getStaticProps() {
  const time = await fetchTime("legacy-isr");
  return { props: { time, pid: process.pid }, revalidate: 10 };
}

export default function LegacyIsr({ time, pid }: { time: TimeResp; pid: number }) {
  return (
    <LessonLayout lesson={pagesRouter}>
      <p className="text-sm">
        <Link href="/legacy" className="underline">
          ← comparison table
        </Link>
      </p>
      <DemoSection
        title="getStaticProps + revalidate: 10 (ISR)"
        kind="server"
        description="Cached HTML, regenerated in the background after 10 seconds."
      >
        <ServerBadge at={time.servedAt} pid={pid} />
        <RenderTimestamp at={time.servedAt} />
        <p className="font-mono text-xs text-zinc-500" data-marker="legacy-isr">
          hit #{time.hit} · random {time.random}
        </p>
      </DemoSection>
    </LessonLayout>
  );
}
