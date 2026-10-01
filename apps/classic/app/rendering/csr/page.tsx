import Link from "next/link";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { HitCounter, RenderTimestamp, ViewSourceCheck } from "@lab/learn-ui/client";
import { csr } from "@lab/learn-ui/content";
import { BffProducts, CsrProducts } from "./csr-products";

export const metadata = { title: "CSR" };

// The page (shell) itself is static. Only the data inside is client-rendered.
export default function CsrPage() {
  return (
    <LessonLayout lesson={csr}>
      <DemoSection title="0. The shell" kind="server" description="Prerendered at build. Same for everyone, CDN-cacheable.">
        <div className="flex flex-wrap items-center gap-3">
          <ServerBadge label="static shell" />
          <RenderTimestamp at={new Date().toISOString()} label="shell generated at" />
        </div>
      </DemoSection>

      <DemoSection
        title="1. Fetch in useEffect, direct to an API"
        kind="client"
        description={
          <>
            The browser calls <code>mock-api:4000/products?tag=csr</code> after hydration. Look in the Network tab.
          </>
        }
      >
        <CsrProducts />
      </DemoSection>

      <DemoSection
        title="2. Fetch through a Route Handler (BFF)"
        kind="mixed"
        description={
          <>
            The browser calls <code>/api/products</code> (same origin). That handler runs on the server and calls
            upstream, so secrets and internal URLs never reach the browser.
          </>
        }
      >
        <BffProducts />
      </DemoSection>

      <DemoSection title="3. Misconception check" kind="mixed">
        <p className="text-sm">
          <Link href="/rendering/csr/client-page" className="underline">
            /rendering/csr/client-page
          </Link>{" "}
          starts with <code>&apos;use client&apos;</code>. Is its content in the server HTML? Open it and run the
          view-source check.
        </p>
      </DemoSection>

      <div className="grid gap-4 md:grid-cols-2">
        <ViewSourceCheck marker="csr-data" />
        <HitCounter filter={["tag=csr", "tag=bff"]} />
      </div>
    </LessonLayout>
  );
}
