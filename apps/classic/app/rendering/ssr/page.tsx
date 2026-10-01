import Link from "next/link";
import { cookies, headers } from "next/headers";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp, RequestInfo, ViewSourceCheck } from "@lab/learn-ui/client";
import { Button } from "@lab/learn-ui/ui";
import { ssr } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";
import { clearName, setName } from "./actions";

export const metadata = { title: "SSR" };

const TRIGGERS = ["none", "cookies", "headers", "search-params", "no-store", "force-dynamic", "connection"];

export default async function SsrPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  // Each of these reads request-time data, so the route renders on every request (ƒ Dynamic).
  const { q } = await searchParams;
  const ua = (await headers()).get("user-agent") ?? "unknown";
  const name = (await cookies()).get("lab-name")?.value;
  const time = await getTime("ssr", { cache: "no-store" });
  const renderedAt = new Date().toISOString();

  return (
    <LessonLayout lesson={ssr}>
      <DemoSection
        title="1. Rendered for THIS request"
        kind="server"
        description="Reload: the timestamp and the upstream hit counter change every time."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge />
          <RenderTimestamp at={renderedAt} />
        </div>
        <p className="font-mono text-xs text-zinc-500">
          mock-api /time?tag=ssr hit #{time.hit} · random {time.random}
        </p>
      </DemoSection>

      <DemoSection title="2. Personalised from request data" kind="server">
        <ul className="space-y-1 text-sm" data-marker="ssr-request">
          <li>
            <span className="text-zinc-500">cookie lab-name:</span>{" "}
            <strong>{name ? `Hello, ${name}` : "(not set)"}</strong>
          </li>
          <li>
            <span className="text-zinc-500">searchParams.q:</span> <code>{q ?? "(none, try ?q=hello)"}</code>
          </li>
          <li className="truncate">
            <span className="text-zinc-500">user-agent header:</span> <code>{ua}</code>
          </li>
        </ul>
        <form action={setName} className="flex gap-2">
          <input
            name="name"
            placeholder="your name"
            className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
            defaultValue={name}
          />
          <Button type="submit">set cookie (Server Action)</Button>
          <Button type="submit" variant="ghost" formAction={clearName}>
            clear
          </Button>
        </form>
      </DemoSection>

      <DemoSection
        title="3. What makes a route dynamic?"
        kind="server"
        description="Each page below differs in exactly one line. Reload each one and see whether the timestamp moves."
      >
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((t) => (
            <Link
              key={t}
              href={`/rendering/ssr/triggers/${t}${t === "search-params" ? "?x=1" : ""}`}
              className="rounded-md border border-zinc-700 px-2 py-1 font-mono text-xs hover:bg-zinc-800"
            >
              {t}
            </Link>
          ))}
        </div>
      </DemoSection>

      <div className="grid gap-4 md:grid-cols-2">
        <HitCounter filter={["tag=ssr"]} />
        <RequestInfo />
      </div>
      <ViewSourceCheck marker="ssr-request" />
    </LessonLayout>
  );
}
