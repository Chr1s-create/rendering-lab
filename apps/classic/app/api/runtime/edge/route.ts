export const runtime = "edge";

declare const EdgeRuntime: string | undefined;

export function GET(request: Request) {
  return Response.json({
    runtime: "edge",
    edgeRuntime: typeof EdgeRuntime === "string" ? EdgeRuntime : null,
    nodeVersion: null,
    hasWebCrypto: typeof crypto?.subtle !== "undefined",
    userAgent: request.headers.get("user-agent"),
    now: new Date().toISOString(),
  });
}
