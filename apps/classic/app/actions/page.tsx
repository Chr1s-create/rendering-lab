import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp } from "@lab/learn-ui/client";
import { Button } from "@lab/learn-ui/ui";
import { actions } from "@lab/learn-ui/content";
import { getTodos } from "@/lib/api";
import { addTodoPlain } from "./actions";
import { RouteHandlerPlayground } from "./route-handler-playground";
import { TodoForm } from "./todo-form";

export const metadata = { title: "Server Actions" };

export default async function ActionsPage() {
  // Read in the Server Component (reads go here; writes go in actions).
  const { todos, servedAt } = await getTodos({ cache: "force-cache", next: { tags: ["todos"] } });

  return (
    <LessonLayout lesson={actions}>
      <DemoSection
        title="1. useActionState + useOptimistic"
        kind="mixed"
        description="The list comes from a Server Component. The form is a Client Component calling a Server Action."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge label="list rendered" />
          <RenderTimestamp at={servedAt} label="todos fetched at" />
        </div>
        <TodoForm todos={todos} />
      </DemoSection>

      <DemoSection
        title="2. Progressive enhancement (no client JS needed)"
        kind="server"
        description={
          <>
            A plain <code>&lt;form action=&#123;serverAction&#125;&gt;</code> rendered by a Server Component. Disable
            JavaScript and it still works.
          </>
        }
      >
        <form action={addTodoPlain} className="flex gap-2" data-testid="plain-form">
          <input
            name="text"
            placeholder="works without JS"
            className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
          />
          <Button type="submit" variant="outline">
            add (plain form)
          </Button>
        </form>
      </DemoSection>

      <DemoSection title="3. Route Handlers" kind="server" description="Standard HTTP endpoints in app/api/**/route.ts.">
        <RouteHandlerPlayground />
      </DemoSection>
    </LessonLayout>
  );
}
