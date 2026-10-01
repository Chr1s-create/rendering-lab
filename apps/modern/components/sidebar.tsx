import Link from "next/link";
import { CLASSIC_URL } from "@lab/learn-ui/lib";

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/ppr", label: "Partial Prerendering" },
  { href: "/use-cache", label: "'use cache' levels & keys" },
  { href: "/cache-life", label: "cacheLife profiles" },
  { href: "/cache-tag", label: "cacheTag: updateTag vs revalidateTag" },
  { href: "/runtime-data", label: "Runtime data & connection()" },
  { href: "/migration", label: "Classic to modern migration" },
  { href: "/interview", label: "Interview hub" },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-zinc-800 p-4">
      <p className="mb-4 text-sm font-bold tracking-tight">
        Rendering Lab <span className="font-normal text-violet-400">· modern</span>
      </p>
      <nav className="space-y-1">
        {NAV.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="block rounded-md px-2 py-1 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            {i.label}
          </Link>
        ))}
        <a href={CLASSIC_URL} className="mt-4 block rounded-md px-2 py-1 text-sm text-sky-300 hover:text-sky-100">
          ← Back to apps/classic (:3000)
        </a>
      </nav>
    </aside>
  );
}
