"use client";

import { startTransition, useActionState, useOptimistic, useRef } from "react";
import { Badge, Button } from "@lab/learn-ui/ui";
import { addTodo, type AddTodoState } from "./actions";

type Todo = { id: number; text: string; done: boolean; pending?: boolean };

export function TodoForm({ todos }: { todos: Todo[] }) {
  const [state, formAction, pending] = useActionState<AddTodoState, FormData>(addTodo, { error: null, ok: 0 });
  const [optimisticTodos, addOptimistic] = useOptimistic(todos, (current: Todo[], t: Todo) => [...current, t]);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = String(fd.get("text") ?? "").trim();
    startTransition(() => {
      if (text) addOptimistic({ id: -Date.now(), text, done: false, pending: true });
      formAction(fd);
    });
    formRef.current?.reset();
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1 text-sm" data-testid="todo-list">
        {optimisticTodos.map((t) => (
          <li key={t.id} className={t.pending ? "text-zinc-500 italic" : ""}>
            {t.done ? "✓" : "○"} {t.text} {t.pending && <Badge tone="warn">optimistic, saving…</Badge>}
          </li>
        ))}
      </ul>
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-center gap-2" data-testid="todo-form">
        <input
          name="text"
          placeholder="new todo"
          className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
        />
        <label className="flex items-center gap-1 text-xs text-zinc-400">
          <input type="checkbox" name="fail" /> simulate failure
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "saving…" : "add (Server Action)"}
        </Button>
      </form>
      {state.error && (
        <p className="text-sm text-red-400" data-testid="action-error">
          {state.error}
        </p>
      )}
      {state.ok > 0 && !state.error && <p className="text-xs text-emerald-400">saved {state.ok} todo(s) this session</p>}
    </div>
  );
}
