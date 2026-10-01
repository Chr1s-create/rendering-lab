import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return Response.json(
    { received: body, method: request.method, contentType: request.headers.get("content-type") },
    { status: 201, headers: { "x-handled-by": "route-handler" } },
  );
}
