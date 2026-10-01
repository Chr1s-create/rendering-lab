import type { GetServerSideProps } from "next";
import Link from "next/link";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp } from "@lab/learn-ui/client";
import { pagesRouter } from "@lab/learn-ui/content";
import { fetchTime, type TimeResp } from "@/lib/pages-api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const time = await fetchTime("legacy-ssr");
  return {
    props: {
      time,
      pid: process.pid,
      q: typeof ctx.query.q === "string" ? ctx.query.q : null,
    },
  };
};

export default function LegacySsr({ time, pid, q }: { time: TimeResp; pid: number; q: string | null }) {
  return (
    <LessonLayout lesson={pagesRouter}>
      <p className="text-sm">
        <Link href="/legacy" className="underline">
          ← comparison table
        </Link>
      </p>
      <DemoSection
        title="getServerSideProps (SSR)"
        kind="server"
        description="This ran for this request. Reload: the timestamp moves."
      >
        <ServerBadge at={time.servedAt} pid={pid} />
        <RenderTimestamp at={time.servedAt} />
        <p className="font-mono text-xs text-zinc-500" data-marker="legacy-ssr">
          hit #{time.hit} · random {time.random} · query.q={q ?? "(none, try ?q=hello)"}
        </p>
      </DemoSection>
    </LessonLayout>
  );
}
