import Link from "next/link";
import { DemoSection, LessonLayout } from "@lab/learn-ui/server";
import { CLASSIC_URL } from "@lab/learn-ui/lib";
import { migration } from "@lab/learn-ui/content";
import { CodeBlock } from "@lab/learn-ui/ui";

export const metadata = { title: "Migration" };

const ROWS: { classic: string; modern: string; classicHref: string; modernHref: string }[] = [
  {
    classic: "export const revalidate = 10",
    modern: "'use cache' + cacheLife({ revalidate: 10 })",
    classicHref: `${CLASSIC_URL}/rendering/isr`,
    modernHref: "/cache-life",
  },
  {
    classic: "export const dynamic = 'force-dynamic'",
    modern: "default + Suspense around dynamic reads",
    classicHref: `${CLASSIC_URL}/rendering/ssr/triggers/force-dynamic`,
    modernHref: "/ppr",
  },
  {
    classic: "export const dynamic = 'force-static'",
    modern: "'use cache' + cacheLife('max')",
    classicHref: `${CLASSIC_URL}/rendering/ssg`,
    modernHref: "/use-cache",
  },
  {
    classic: "fetch next.tags + revalidateTag",
    modern: "cacheTag() + updateTag / revalidateTag(tag, 'max')",
    classicHref: `${CLASSIC_URL}/caching`,
    modernHref: "/cache-tag",
  },
  {
    classic: "cookies() in the page (whole route dynamic)",
    modern: "cookies() inside <Suspense> (PPR hole)",
    classicHref: `${CLASSIC_URL}/rendering/ssr`,
    modernHref: "/runtime-data",
  },
  {
    classic: "unstable_cache(fn, keys, opts)",
    modern: "'use cache' + cacheTag + cacheLife (no keyParts)",
    classicHref: `${CLASSIC_URL}/caching`,
    modernHref: "/use-cache",
  },
];

export default function MigrationPage() {
  return (
    <LessonLayout lesson={migration}>
      <DemoSection title="Side-by-side" kind="server">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-zinc-500">
              <tr>
                <th className="py-1 pr-3">Classic (apps/classic)</th>
                <th className="py-1 pr-3">Modern (this app)</th>
                <th className="py-1">Open</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.classic} className="border-t border-zinc-800 align-top">
                  <td className="py-2 pr-3 font-mono text-xs">{row.classic}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.modern}</td>
                  <td className="py-2 text-xs">
                    <a className="underline" href={row.classicHref}>
                      classic
                    </a>
                    {" · "}
                    <Link className="underline" href={row.modernHref}>
                      modern
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DemoSection>

      <DemoSection title="ISR page, both dialects" kind="server">
        <CodeBlock
          code={`// classic — apps/classic/app/rendering/isr/page.tsx
export const revalidate = 10;
const time = await getTime("isr", { next: { revalidate: 10, tags: ["isr-time"] } });

// modern — apps/modern/app/cache-life/page.tsx
async function WithProfile() {
  "use cache";
  cacheLife({ stale: 5, revalidate: 10, expire: 60 });
  cacheTag("life-inline");
  return getTime("life-inline");
}`}
        />
      </DemoSection>
    </LessonLayout>
  );
}
