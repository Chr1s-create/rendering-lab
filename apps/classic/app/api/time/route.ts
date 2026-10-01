// GET Route Handlers are dynamic by default (Next 15+): runs on every request.
export async function GET() {
  return Response.json({ handler: "dynamic", now: new Date().toISOString() });
}
