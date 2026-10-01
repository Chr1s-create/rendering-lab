import Link from "next/link";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp, RequestInfo, ViewSourceCheck } from "@lab/learn-ui/client";
import { ssg } from "@lab/learn-ui/content";
import { getPosts, getTime } from "@/lib/api";

export const metadata = { title: "SSG" };

// No cookies()/headers()/searchParams -> this route is prerendered at build time (○ Static).
export default async function SsgPage() {
  const [time, { posts }] = await Promise.all([
    getTime("ssg", { cache: "force-cache" }),
    getPosts({ cache: "force-cache" }),
  ]);

  return (
    <LessonLayout lesson={ssg}>
      <DemoSection
        title="1. A statically generated page"
        kind="server"
        description={
          <>
            This component ran during <code>next build</code>. Reload as often as you like: the timestamp and the
            upstream counter stay frozen.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge label="built on server" />
          <RenderTimestamp at={time.servedAt} label="mock-api /time answered at" />
        </div>
        <p className="font-mono text-xs text-zinc-500">
          upstream hit #{time.hit} · random {time.random}
        </p>
      </DemoSection>

      <DemoSection
        title="2. Data baked into the HTML"
        kind="server"
        description="The list below is part of the prerendered HTML. Crawlers and no-JS users see it."
      >
        <ul data-marker="ssg-posts" className="list-disc pl-5 text-sm">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link className="underline" href={`/rendering/ssg/${p.slug}`}>
                {p.title}
              </Link>
              <span className="text-zinc-500"> /rendering/ssg/{p.slug}</span>
            </li>
          ))}
          <li>
            <Link className="underline" href="/rendering/ssg/does-not-exist">
              does-not-exist
            </Link>
            <span className="text-zinc-500"> (404 via notFound())</span>
          </li>
        </ul>
      </DemoSection>

      <div className="grid gap-4 md:grid-cols-2">
        <HitCounter filter={["tag=ssg", "/posts"]} />
        <RequestInfo />
      </div>
      <ViewSourceCheck marker="ssg-posts" />
    </LessonLayout>
  );
}
