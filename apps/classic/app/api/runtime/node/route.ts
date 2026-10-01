import os from "node:os";

export const runtime = "nodejs"; // the default, stated explicitly

export function GET() {
  return Response.json({
    runtime: "nodejs",
    nodeVersion: process.version,
    pid: process.pid,
    platform: os.platform(),
    hasFs: true,
    uptimeSec: Math.round(process.uptime()),
    now: new Date().toISOString(),
  });
}
