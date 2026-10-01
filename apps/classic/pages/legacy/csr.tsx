import Link from "next/link";
import { DemoSection, LessonLayout } from "@lab/learn-ui/server";
import { pagesRouter } from "@lab/learn-ui/content";
import { LegacyCsrProducts } from "@/components/legacy-csr-products";

export default function LegacyCsr() {
  return (
    <LessonLayout lesson={pagesRouter}>
      <p className="text-sm">
        <Link href="/legacy" className="underline">
          ← comparison table
        </Link>
      </p>
      <DemoSection
        title="CSR in the Pages Router"
        kind="client"
        description="No getServerSideProps. The list is fetched after hydration. View-source will not contain the marker until JS runs."
      >
        <LegacyCsrProducts />
      </DemoSection>
    </LessonLayout>
  );
}
