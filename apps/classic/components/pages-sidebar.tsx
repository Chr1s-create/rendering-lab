"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { MODERN_URL, cn } from "@lab/learn-ui/lib";
import { NAV } from "./sidebar";

export function PagesSidebar() {
  const { pathname } = useRouter();
  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-zinc-800 p-4">
      <p className="mb-4 text-sm font-bold tracking-tight">
        Rendering Lab <span className="font-normal text-zinc-500">· pages/</span>
      </p>
      <nav className="space-y-4">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">{g.group}</p>
            {g.items.map((i) => {
              const active = pathname === i.href || (i.href !== "/" && pathname.startsWith(`${i.href}/`));
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={cn(
                    "block rounded-md px-2 py-1 text-sm transition-colors",
                    active ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:text-zinc-100",
                  )}
                >
                  {i.label}
                </Link>
              );
            })}
          </div>
        ))}
        <a href={MODERN_URL} className="block rounded-md px-2 py-1 text-sm text-violet-300 hover:text-violet-100">
          Open apps/modern (:3001) ↗
        </a>
      </nav>
    </aside>
  );
}
