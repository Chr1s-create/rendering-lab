"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateDataCacheDemo() {
  revalidateTag("data-cache-demo", { expire: 0 });
}

export async function revalidateFullRoute() {
  revalidatePath("/caching/full-route");
}
