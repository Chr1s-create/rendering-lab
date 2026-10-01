// Opt a GET handler into static generation: executed once at build, then served from cache.
export const dynamic = "force-static";

export async function GET() {
  return Response.json({ handler: "force-static", builtAt: new Date().toISOString() });
}
