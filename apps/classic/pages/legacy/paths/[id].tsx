import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp } from "@lab/learn-ui/client";
import { Callout } from "@lab/learn-ui/ui";
import { pagesRouter } from "@lab/learn-ui/content";
import { fetchTime, type TimeResp } from "@/lib/pages-api";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: "1" } }, { params: { id: "2" } }],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const id = String(ctx.params?.id ?? "");
  const time = await fetchTime(`legacy-path-${id}`);
  return { props: { id, time, pid: process.pid, prebuilt: id === "1" || id === "2" } };
};

export default function LegacyPath({
  id,
  time,
  pid,
  prebuilt,
}: {
  id: string;
  time: TimeResp;
  pid: number;
  prebuilt: boolean;
}) {
  return (
    <LessonLayout lesson={pagesRouter}>
      <p className="text-sm">
        <Link href="/legacy" className="underline">
          ← comparison table
        </Link>
      </p>
      <Callout tone={prebuilt ? "tip" : "info"} title={prebuilt ? "In getStaticPaths" : "fallback: 'blocking'"}>
        {prebuilt ? (
          <>This id was prebuilt at build time.</>
        ) : (
          <>
            id <code>{id}</code> was not listed. fallback: &apos;blocking&apos; rendered it on the server (the user
            waited), then cached it. Try <Link href="/legacy/paths/99">/legacy/paths/99</Link>.
          </>
        )}
      </Callout>
      <DemoSection title={`getStaticPaths id=${id}`} kind="server">
        <ServerBadge at={time.servedAt} pid={pid} />
        <RenderTimestamp at={time.servedAt} />
        <p className="font-mono text-xs text-zinc-500" data-marker="legacy-path">
          hit #{time.hit} · random {time.random}
        </p>
      </DemoSection>
    </LessonLayout>
  );
}
