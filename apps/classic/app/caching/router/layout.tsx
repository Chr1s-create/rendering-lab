import Link from "next/link";
import { NavLog } from "./nav-log";

// The layout persists across navigations between its children; so does NavLog's client state.
export default function RouterCacheLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <Link href="/caching" className="text-sm text-zinc-400 underline">
        ← back to Caching
      </Link>
      <h1 className="text-2xl font-bold">Router Cache (client)</h1>
      <p className="text-sm text-zinc-400">
        Click between the pages with <code>&lt;Link&gt;</code>. Each page reports the server timestamp it was rendered
        with. Static segments are reused from the in-memory cache. Dynamic segments are refetched on every navigation
        (<code>staleTimes.dynamic = 0</code>).
      </p>
      <nav className="flex gap-2">
        <Link href="/caching/router/static" className="rounded-md border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800">
          static page
        </Link>
        <Link href="/caching/router/dynamic" className="rounded-md border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800">
          dynamic page
        </Link>
      </nav>
      <div className="rounded-lg border border-zinc-800 p-4">{children}</div>
      <NavLog />
    </div>
  );
}
