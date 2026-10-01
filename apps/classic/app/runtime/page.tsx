import Link from "next/link";
import { headers } from "next/headers";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { RequestInfo } from "@lab/learn-ui/client";
import { runtime } from "@lab/learn-ui/content";
import { RuntimeCompare } from "./runtime-compare";

export const metadata = { title: "Runtimes & proxy" };

export default async function RuntimePage() {
  const fromProxy = (await headers()).get("x-from-proxy");
  return (
    <LessonLayout lesson={runtime}>
      <DemoSection title="1. Same handler, two runtimes" kind="server">
        <RuntimeCompare />
      </DemoSection>

      <DemoSection
        title="2. proxy.ts ran before this page"
        kind="server"
        description="proxy.ts added a request header (read here with headers()) and a response header (x-proxy-seen)."
      >
        <ServerBadge />
        <p className="font-mono text-sm" data-marker="from-proxy">
          x-from-proxy: {fromProxy ?? "(missing: is proxy.ts matching /runtime?)"}
        </p>
        <RequestInfo />
      </DemoSection>

      <DemoSection title="3. Rewrites and redirects" kind="server">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            <a className="underline" href="/runtime/ab">
              /runtime/ab
            </a>{" "}
            is rewritten to <code>/runtime/ab/a</code> or <code>/runtime/ab/b</code> using a sticky cookie, and the URL
            doesn&apos;t change.
          </li>
          <li>
            <Link className="underline" href="/runtime/old-path" prefetch={false}>
              /runtime/old-path
            </Link>{" "}
            gets a 307 redirect to <code>/runtime</code>.
          </li>
        </ul>
      </DemoSection>
    </LessonLayout>
  );
}
