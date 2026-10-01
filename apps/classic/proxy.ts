import { NextResponse, type NextRequest } from "next/server";

// Next 16: "middleware" is now "proxy". Runs before routing (and before the page cache) for matched paths.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/runtime/old-path") {
    return NextResponse.redirect(new URL("/runtime", request.url));
  }

  if (pathname === "/runtime/ab") {
    const existing = request.cookies.get("ab-bucket")?.value;
    const bucket = existing === "a" || existing === "b" ? existing : Math.random() < 0.5 ? "a" : "b";
    const res = NextResponse.rewrite(new URL(`/runtime/ab/${bucket}`, request.url));
    if (!existing) res.cookies.set("ab-bucket", bucket, { path: "/", sameSite: "lax" });
    res.headers.set("x-ab-bucket", bucket);
    res.headers.set("x-proxy-seen", "1");
    return res;
  }

  // Forward a request header to the route AND set a response header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-from-proxy", `proxy saw ${pathname} at ${new Date().toISOString()}`);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("x-proxy-seen", "1");
  return res;
}

export const config = {
  matcher: ["/runtime", "/runtime/:path*"],
};
