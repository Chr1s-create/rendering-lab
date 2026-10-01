"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Button, Card, CardTitle } from "@lab/learn-ui/ui";

type Entry = { page: string; serverTs: string; at: string };
let entries: Entry[] = [];
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const EMPTY: Entry[] = [];

export function RecordVisit({ page, serverTs }: { page: string; serverTs: string }) {
  useEffect(() => {
    entries = [...entries, { page, serverTs, at: new Date().toISOString() }].slice(-12);
    listeners.forEach((l) => l());
  }, [page, serverTs]);
  return null;
}

export function NavLog() {
  const log = useSyncExternalStore(subscribe, () => entries, () => EMPTY);
  const router = useRouter();
  return (
    <Card data-testid="nav-log">
      <div className="flex items-center justify-between">
        <CardTitle className="mb-0">Navigation log (client memory)</CardTitle>
        <Button size="sm" variant="outline" onClick={() => router.refresh()}>
          router.refresh()
        </Button>
      </div>
      <table className="mt-2 w-full font-mono text-xs">
        <thead className="text-left text-zinc-500">
          <tr>
            <th>visited at</th>
            <th>page</th>
            <th>server rendered at</th>
          </tr>
        </thead>
        <tbody>
          {log.map((e, i) => {
            const prev = log.slice(0, i).reverse().find((p) => p.page === e.page);
            const reused = prev?.serverTs === e.serverTs;
            return (
              <tr key={i} className="border-t border-zinc-800">
                <td>{e.at.slice(11, 23)}</td>
                <td>{e.page}</td>
                <td className={reused ? "text-emerald-400" : ""}>
                  {e.serverTs.slice(11, 23)} {prev && (reused ? "(reused from cache)" : "(fresh from server)")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
