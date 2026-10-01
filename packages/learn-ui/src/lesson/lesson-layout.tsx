import type { ReactNode } from "react";
import type { Lesson } from "../types";
import { InterviewPanel } from "../quiz/interview-panel";
import { Badge, Callout, Card, CardTitle, CodeBlock } from "../ui/primitives";
import { LessonTabs } from "./lesson-tabs";

/** Server-safe (no hooks): usable from App Router Server Components AND Pages Router pages. */
export function LessonLayout({ lesson, children }: { lesson: Lesson; children: ReactNode }) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{lesson.app === "classic" ? "apps/classic" : "apps/modern · cacheComponents"}</Badge>
          <Badge tone="neutral">{lesson.href}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="max-w-3xl text-zinc-400">{lesson.tagline}</p>
      </header>
      <LessonTabs
        demo={<div className="space-y-4">{children}</div>}
        notes={<NotesView lesson={lesson} />}
        tryThis={<TryThisView lesson={lesson} />}
        verify={<VerifyView lesson={lesson} />}
        interview={<InterviewPanel lesson={lesson} />}
      />
    </article>
  );
}

function NotesView({ lesson }: { lesson: Lesson }) {
  const n = lesson.notes;
  const rows: [string, string][] = [
    ["What", n.what],
    ["Where (server / client)", n.where],
    ["When", n.when],
    ["Why / when to choose it", n.why],
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map(([title, body]) => (
          <Card key={title}>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm whitespace-pre-line text-zinc-300">{body}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardTitle>Tradeoffs</CardTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
            {n.tradeoffs.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>Common mistakes</CardTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
            {n.mistakes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Key APIs</h3>
        {n.apis.map((a) => (
          <div key={a.name}>
            <p className="mb-1 font-mono text-sm text-zinc-300">{a.name}</p>
            <CodeBlock code={a.snippet} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TryThisView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-3">
      <Callout tone="warn" title="Use production mode for caching experiments">
        <code>next dev</code> re-renders everything on each request, so ISR, SSG, and the Full Route Cache look
        &quot;dynamic&quot;. Run <code>pnpm build &amp;&amp; pnpm start:prod</code> to see the real behavior.
      </Callout>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
        {lesson.tryThis.map((s) => (
          <li key={s} className="whitespace-pre-line">
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function VerifyView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Run these from the repo root while <code>pnpm start:prod</code> is running in another terminal.
      </p>
      {lesson.verify.map((v) => (
        <Card key={v.label} className="space-y-2">
          <CardTitle>{v.label}</CardTitle>
          <CodeBlock code={v.cmd} />
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-500">Expect: </span>
            {v.expect}
          </p>
        </Card>
      ))}
    </div>
  );
}
