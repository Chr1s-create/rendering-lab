import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">404: not found</h1>
      <p className="text-zinc-400">
        This was produced by <code>notFound()</code> (or an unknown route), rendered by <code>app/not-found.tsx</code>.
      </p>
      <Link href="/" className="underline">
        Home
      </Link>
    </div>
  );
}
