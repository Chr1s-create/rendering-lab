import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { ViewSourceCheck } from "@lab/learn-ui/client";
import { hydration } from "@lab/learn-ui/content";
import { ClientOnlyLoader } from "./client-only-loader";
import { MismatchDemo, MountedGuard, SuppressedTime } from "./mismatch-demo";

export const metadata = { title: "Hydration" };

export default function HydrationPage() {
  return (
    <LessonLayout lesson={hydration}>
      <DemoSection
        title="1. Client Components still SSR"
        kind="mixed"
        description="The mismatch playground is a Client Component. Its first HTML still comes from the server."
      >
        <ServerBadge label="page shell" />
        <MismatchDemo />
      </DemoSection>

      <DemoSection title="2. suppressHydrationWarning on one text node" kind="mixed">
        <SuppressedTime />
      </DemoSection>

      <DemoSection
        title="3. Mounted guard"
        kind="client"
        description="The em dash is in the server HTML. The locale time is filled in after useEffect."
      >
        <MountedGuard />
      </DemoSection>

      <DemoSection
        title="4. next/dynamic with ssr: false"
        kind="client"
        description="This subtree is not in the server HTML. View-source will not find the marker."
      >
        <ClientOnlyLoader />
      </DemoSection>

      <ViewSourceCheck marker="client-only-widget" />
    </LessonLayout>
  );
}
