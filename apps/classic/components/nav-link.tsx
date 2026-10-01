"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@lab/learn-ui/lib";

// usePathname() needs the browser router, so this tiny piece is a Client Component
// while the rest of the sidebar stays on the server.
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-md px-2 py-1 text-sm transition-colors",
        active ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:text-zinc-100",
      )}
    >
      {children}
    </Link>
  );
}
