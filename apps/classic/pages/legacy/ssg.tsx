import Link from "next/link";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp } from "@lab/learn-ui/client";
import { pagesRouter } from "@lab/learn-ui/content";
import { fetchTime, type TimeResp } from "@/lib/pages-api";

export async function getStaticProps() {
  const time = await fetchTime("legacy-ssg");
  return { props: { time, pid: process.pid } };
}

export default function LegacySsg({ time, pid }: { time: TimeResp; pid: number }) {
  return (
    <LessonLayout lesson={pagesRouter}>
      <p className="text-sm">
        <Link href="/legacy" className="underline">
          ← comparison table
        </Link>
      </p>
      <DemoSection
        title="getStaticProps (SSG)"
        kind="server"
        description="This ran at build time. Reload: the timestamp stays put."
      >
        <ServerBadge at={time.servedAt} pid={pid} />
        <RenderTimestamp at={time.servedAt} />
        <p className="font-mono text-xs text-zinc-500" data-marker="legacy-ssg">
          hit #{time.hit} · random {time.random}
        </p>
      </DemoSection>
    </LessonLayout>
  );
}
