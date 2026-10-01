import { API } from "@/lib/api";

// Backend-for-frontend: the browser calls this; this calls upstream from the server.
// GET Route Handlers are dynamic by default (not cached) since Next 15.
export async function GET() {
  const r = await fetch(`${API}/products?tag=bff`, { cache: "no-store" });
  return Response.json(await r.json());
}
