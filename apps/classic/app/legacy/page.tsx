import Link from "next/link";
import { DemoSection, LessonLayout } from "@lab/learn-ui/server";
import { pagesRouter } from "@lab/learn-ui/content";
import { Card, CardTitle } from "@lab/learn-ui/ui";

export const metadata = { title: "Pages Router" };

const ROWS = [
  {
    pages: "getStaticProps",
    app: "async Server Component, no dynamic APIs",
    href: "/legacy/ssg",
    twin: "/rendering/ssg",
  },
  {
    pages: "getServerSideProps",
    app: "async Server Component + cookies/headers/searchParams or cache: 'no-store'",
    href: "/legacy/ssr",
    twin: "/rendering/ssr",
  },
  {
    pages: "getStaticProps + revalidate",
    app: "export const revalidate = N  (or fetch next.revalidate)",
    href: "/legacy/isr",
    twin: "/rendering/isr",
  },
  {
    pages: "no data fn + useEffect",
    app: "Client Component fetch (same idea)",
    href: "/legacy/csr",
    twin: "/rendering/csr",
  },
  {
    pages: "getStaticPaths + fallback",
    app: "generateStaticParams + dynamicParams",
    href: "/legacy/paths/1",
    twin: "/rendering/ssg/hello-ssg",
  },
];

export default function LegacyHubPage() {
  return (
    <LessonLayout lesson={pagesRouter}>
      <DemoSection
        title="Pages Router lives under pages/"
        kind="server"
        description="These routes are real Pages Router files. The comparison table maps each one to the App Router lesson."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-zinc-500">
              <tr>
                <th className="py-1 pr-3">Pages API</th>
                <th className="py-1 pr-3">App Router equivalent</th>
                <th className="py-1 pr-3">Demo</th>
                <th className="py-1">Twin</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.pages} className="border-t border-zinc-800">
                  <td className="py-2 pr-3 font-mono text-xs">{row.pages}</td>
                  <td className="py-2 pr-3 text-zinc-300">{row.app}</td>
                  <td className="py-2 pr-3">
                    <Link className="underline" href={row.href}>
                      {row.href}
                    </Link>
                  </td>
                  <td className="py-2">
                    <Link className="underline" href={row.twin}>
                      {row.twin}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DemoSection>

      <Card>
        <CardTitle>Remember</CardTitle>
        <p className="text-sm text-zinc-300">
          Pages Router page components hydrate in the browser. Do not put secrets in the component body — only in
          getStaticProps / getServerSideProps. The App Router can keep that code in a Server Component that never
          ships.
        </p>
      </Card>
    </LessonLayout>
  );
}
