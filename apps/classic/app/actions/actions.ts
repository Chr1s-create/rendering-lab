"use server";

import { revalidatePath } from "next/cache";
import { API } from "@/lib/api";

export type AddTodoState = { error: string | null; ok: number };

// Server Actions are PUBLIC endpoints: validate everything (and check auth in a real app).
export async function addTodo(prev: AddTodoState, formData: FormData): Promise<AddTodoState> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { ...prev, error: "Text is required (validated on the server)." };
  if (text.length > 80) return { ...prev, error: "Max 80 characters." };
  const fail = formData.get("fail") === "on";

  await new Promise((r) => setTimeout(r, 700)); // make pending/optimistic states visible
  const r = await fetch(`${API}/todos${fail ? "?fail=1" : ""}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) return { ...prev, error: `Server failed (${r.status}). The optimistic item was rolled back.` };

  revalidatePath("/actions");
  return { error: null, ok: prev.ok + 1 };
}

// Plain form action (no client JS needed): used by the progressive-enhancement form.
export async function addTodoPlain(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await fetch(`${API}/todos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  revalidatePath("/actions");
}
