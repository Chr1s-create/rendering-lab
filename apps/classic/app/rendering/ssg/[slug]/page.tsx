import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoSection, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp, RequestInfo } from "@lab/learn-ui/client";
import { Callout } from "@lab/learn-ui/ui";
import { getPost, getPosts } from "@/lib/api";

// Default is true: slugs NOT returned below are rendered on first request, then cached.
// Change to false and rebuild: unknown slugs become 404.
export const dynamicParams = true;

// Only the first two posts are prebuilt at build time. The third is generated on demand.
export async function generateStaticParams() {
  const { posts } = await getPosts({ cache: "force-cache" });
  return posts.slice(0, 2).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `SSG post: ${slug}` };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPost(slug, { cache: "force-cache" });
  if (!data) notFound();
  const prebuilt = ["hello-ssg", "why-isr"].includes(slug);

  return (
    <div className="space-y-4">
      <Link href="/rendering/ssg" className="text-sm text-zinc-400 underline">
        ← back to SSG lesson
      </Link>
      <h1 className="text-2xl font-bold">{data.post.title}</h1>
      <Callout tone={prebuilt ? "tip" : "info"} title={prebuilt ? "Prebuilt at build time" : "Generated on demand"}>
        {prebuilt ? (
          <>This slug was returned by <code>generateStaticParams</code>, so its HTML existed before anyone visited.</>
        ) : (
          <>
            This slug was <strong>not</strong> in <code>generateStaticParams</code>. Because{" "}
            <code>dynamicParams = true</code>, the first request rendered it (<code>x-nextjs-cache: MISS</code>), and
            later requests are served from cache (<code>HIT</code>).
          </>
        )}
      </Callout>
      <DemoSection title="Proof" kind="server">
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge />
          <RenderTimestamp at={data.servedAt} label="data fetched at" />
        </div>
        <p className="text-sm" data-marker="ssg-post-body">
          {data.post.body}
        </p>
      </DemoSection>
      <RequestInfo />
    </div>
  );
}
