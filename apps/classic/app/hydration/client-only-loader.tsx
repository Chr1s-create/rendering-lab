"use client";

import dynamic from "next/dynamic";

const Widget = dynamic(() => import("./client-only"), {
  ssr: false,
  loading: () => <p className="text-sm text-zinc-500">loading client-only widget…</p>,
});

export function ClientOnlyLoader() {
  return <Widget />;
}
