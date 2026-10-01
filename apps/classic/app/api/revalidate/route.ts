import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

// On-demand ISR webhook. A CMS would call this after publishing.
export async function POST(request: NextRequest) {
  if (request.headers.get("x-lab-secret") !== (process.env.REVALIDATE_SECRET ?? "lab")) {
    return NextResponse.json({ error: "bad secret" }, { status: 401 });
  }
  const tag = request.nextUrl.searchParams.get("tag");
  const path = request.nextUrl.searchParams.get("path");
  if (tag) revalidateTag(tag, "max");
  if (path) revalidatePath(path);
  return NextResponse.json({ revalidated: Boolean(tag || path), tag, path, now: new Date().toISOString() });
}
