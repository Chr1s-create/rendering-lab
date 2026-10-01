import { Badge } from "../ui/primitives";
import { formatTime } from "../lib";

/**
 * Proof that a piece of UI was produced on the SERVER.
 * In App Router this is a Server Component: its code never ships to the browser.
 * In Pages Router, pass `at`/`pid` from getStaticProps/getServerSideProps (components run on both sides there).
 */
export function ServerBadge({ label = "server", at, pid }: { label?: string; at?: string; pid?: number }) {
  const renderedAt = at ?? new Date().toISOString();
  const processId = pid ?? (typeof process !== "undefined" ? process.pid : undefined);
  return (
    <Badge tone="server" data-proof="server-badge" title="Rendered on the server">
      <span aria-hidden>▣</span> {label} · {formatTime(renderedAt)}
      {processId !== undefined && <span className="opacity-60"> · pid {processId}</span>}
    </Badge>
  );
}
