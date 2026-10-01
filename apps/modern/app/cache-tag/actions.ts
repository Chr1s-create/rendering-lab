"use server";

import { revalidateTag, updateTag } from "next/cache";
import { API } from "@/lib/api";

export async function addWithUpdate(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim() || `todo ${Date.now()}`;
  await fetch(`${API}/todos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  updateTag("todos-modern");
}

export async function addWithRevalidate(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim() || `todo ${Date.now()}`;
  await fetch(`${API}/todos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  revalidateTag("todos-modern", "max");
}
