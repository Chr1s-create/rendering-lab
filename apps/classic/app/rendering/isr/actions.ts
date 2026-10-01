"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateIsrPath() {
  revalidatePath("/rendering/isr");
}

export async function revalidateIsrTag() {
  // Next 16: second arg is a cache-life profile. 'max' = mark stale, serve stale while refetching.
  revalidateTag("isr-time", "max");
}

export async function expireTagNow() {
  revalidateTag("isr-time", { expire: 0 });
}
