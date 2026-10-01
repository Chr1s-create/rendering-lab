// Automatically becomes <Suspense fallback={<Loading />}> around page.tsx of this segment.
export default function Loading() {
  return (
    <div className="space-y-3" data-testid="loading-ui">
      <div className="h-8 w-72 animate-pulse rounded bg-zinc-800" />
      <div className="h-4 w-96 animate-pulse rounded bg-zinc-800" />
      <p className="text-sm text-zinc-500">loading.tsx: shown instantly while the page awaits its data (2s)…</p>
    </div>
  );
}
