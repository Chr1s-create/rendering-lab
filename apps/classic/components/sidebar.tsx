import { MODERN_URL } from "@lab/learn-ui/lib";
import { NavLink } from "./nav-link";

export const NAV: { group: string; items: { href: string; label: string }[] }[] = [
  { group: "Start", items: [{ href: "/", label: "Roadmap & mental model" }] },
  {
    group: "Rendering strategies",
    items: [
      { href: "/rendering/ssg", label: "SSG (static)" },
      { href: "/rendering/ssr", label: "SSR (dynamic)" },
      { href: "/rendering/isr", label: "ISR (revalidate)" },
      { href: "/rendering/csr", label: "CSR (browser)" },
    ],
  },
  {
    group: "React Server Components",
    items: [
      { href: "/components/server-vs-client", label: "Server vs Client" },
      { href: "/streaming", label: "Streaming & Suspense" },
    ],
  },
  {
    group: "Data",
    items: [
      { href: "/caching", label: "Caching layers" },
      { href: "/actions", label: "Server Actions & Route Handlers" },
    ],
  },
  {
    group: "Platform",
    items: [
      { href: "/runtime", label: "Edge vs Node & proxy.ts" },
      { href: "/hydration", label: "Hydration" },
    ],
  },
  { group: "Pages Router", items: [{ href: "/legacy", label: "Legacy comparison" }] },
  { group: "Practice", items: [{ href: "/interview", label: "Interview hub" }] },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-zinc-800 p-4">
      <p className="mb-4 text-sm font-bold tracking-tight">
        Rendering Lab <span className="font-normal text-zinc-500">· classic</span>
      </p>
      <nav className="space-y-4">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">{g.group}</p>
            {g.items.map((i) => (
              <NavLink key={i.href} href={i.href}>
                {i.label}
              </NavLink>
            ))}
          </div>
        ))}
        <div>
          <p className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Cache Components</p>
          <a href={MODERN_URL} className="block rounded-md px-2 py-1 text-sm text-violet-300 hover:text-violet-100">
            Open apps/modern (:3001) ↗
          </a>
        </div>
      </nav>
    </aside>
  );
}
