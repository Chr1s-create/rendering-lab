import os from "node:os";
import Link from "next/link";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { ClientBadge } from "@lab/learn-ui/client";
import { serverClient } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";
import { Collapsible, Counter, PropsInspector, ThemeProvider, ThemeSwitch, ThemedBox } from "./client-parts";

export const metadata = { title: "Server vs Client" };

// Lives only in this Server Component module. verify-rsc.sh proves it never appears in .next/static.
const SERVER_SECRET = "SERVER_ONLY_SECRET_MARKER: db-password-123";

async function ServerDetails() {
  const t = await getTime("rsc", { cache: "force-cache" });
  return (
    <div className="space-y-1 rounded-md border border-sky-900 p-3 text-sm">
      <ServerBadge label="ServerDetails (async Server Component)" />
      <p>
        hostname <code>{os.hostname()}</code> · node <code>{process.version}</code>
      </p>
      <p>
        secret length: <code>{SERVER_SECRET.length}</code> (the value is read on the server and never sent)
      </p>
      <p className="font-mono text-xs text-zinc-500">upstream fetched at {t.servedAt}</p>
    </div>
  );
}

export default async function ServerVsClientPage() {
  const servedAt = new Date();
  const lookup = new Map([
    ["ssg", "build"],
    ["ssr", "request"],
  ]);
  const slowPromise = getTime("rsc-promise", { cache: "force-cache" }).then((t) => `resolved at ${t.servedAt}`);

  return (
    <LessonLayout lesson={serverClient}>
      <DemoSection
        title="1. Server Component passing props to a Client Component"
        kind="mixed"
        description={
          <>
            This page is a Server Component (it uses <code>node:os</code>). <code>Counter</code> is a Client
            Component. Its initial value comes from the server and its clicks run in the browser.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge label="page" />
          <Counter start={os.cpus().length} />
        </div>
      </DemoSection>

      <DemoSection
        title="2. Composition: a server child inside a client wrapper"
        kind="mixed"
        description={
          <>
            <code>&lt;Collapsible&gt;</code> is a Client Component with state. <code>&lt;ServerDetails /&gt;</code> is
            passed as <code>children</code>, so it is still rendered on the server, and its code (os, secrets) is
            not in the bundle.
          </>
        }
      >
        <Collapsible label="Show server details">
          <ServerDetails />
        </Collapsible>
      </DemoSection>

      <DemoSection
        title="3. What can cross the boundary (serialization)"
        kind="mixed"
        description={
          <>
            A Date, a Map, and a Promise are passed as props. Passing a plain function is an error:{" "}
            <Link className="underline" href="/components/server-vs-client/serialization?break=1">
              see it break
            </Link>
            .
          </>
        }
      >
        <PropsInspector date={servedAt} map={lookup} promise={slowPromise} />
      </DemoSection>

      <DemoSection
        title="4. Context through a client Provider"
        kind="client"
        description="The provider is a Client Component rendered by this server page. The server-rendered text between the two widgets stays a Server Component."
      >
        <ThemeProvider>
          <div className="space-y-2">
            <ThemeSwitch />
            <p className="text-sm text-zinc-400">
              ↑ and ↓ are client consumers. This sentence is server-rendered children passing through.
            </p>
            <ThemedBox />
          </div>
        </ThemeProvider>
      </DemoSection>

      <DemoSection title="5. Where each piece runs on THIS page" kind="mixed">
        <div className="flex flex-wrap gap-2">
          <ServerBadge label="page.tsx" />
          <ServerBadge label="ServerDetails" />
          <ClientBadge label="Counter / Collapsible / ThemeProvider" />
        </div>
        <p className="text-sm text-zinc-400">
          The client badge says &quot;html only&quot; in the raw HTML (curl) and &quot;hydrated&quot; after JS runs.
          Both are proof that Client Components render on the server first.
        </p>
      </DemoSection>
    </LessonLayout>
  );
}
