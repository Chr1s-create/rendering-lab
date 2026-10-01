import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp } from "@lab/learn-ui/client";
import { Button } from "@lab/learn-ui/ui";
import { cacheTagLesson } from "@lab/learn-ui/content";
import { getTodos } from "@/lib/api";
import { addWithRevalidate, addWithUpdate } from "./actions";

export const metadata = { title: "cacheTag" };

async function CachedTodos() {
  "use cache";
  cacheLife("hours");
  cacheTag("todos-modern");
  const data = await getTodos();
  return (
    <div className="space-y-2" data-marker="cached-todos">
      <ServerBadge at={data.servedAt} />
      <RenderTimestamp at={data.servedAt} label="cached list fetched at" />
      <ul className="list-disc pl-5 text-sm" data-testid="modern-todos">
        {data.todos.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>
      <p className="font-mono text-xs text-zinc-500">upstream hit #{data.hit}</p>
    </div>
  );
}

export default function CacheTagPage() {
  return (
    <LessonLayout lesson={cacheTagLesson}>
      <DemoSection title="Cached list tagged todos-modern" kind="server">
        <Suspense fallback={<p>loading todos…</p>}>
          <CachedTodos />
        </Suspense>
      </DemoSection>

      <DemoSection
        title="Invalidate from a Server Action"
        kind="mixed"
        description="updateTag expires now (read-your-writes). revalidateTag marks stale and refreshes in the background."
      >
        <div className="flex flex-wrap gap-2">
          <form action={addWithUpdate} className="flex gap-2">
            <input
              name="text"
              placeholder="add + updateTag"
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
            />
            <Button type="submit">add + updateTag</Button>
          </form>
          <form action={addWithRevalidate} className="flex gap-2">
            <input
              name="text"
              placeholder="add + revalidateTag"
              className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
            />
            <Button type="submit" variant="outline">
              add + revalidateTag
            </Button>
          </form>
        </div>
      </DemoSection>

      <HitCounter filter={["/todos"]} />
    </LessonLayout>
  );
}
