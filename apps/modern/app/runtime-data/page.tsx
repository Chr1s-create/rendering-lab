import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { DemoSection, LessonLayout, ServerBadge } from "@lab/learn-ui/server";
import { RenderTimestamp } from "@lab/learn-ui/client";
import { Button } from "@lab/learn-ui/ui";
import { runtimeData } from "@lab/learn-ui/content";
import { getTime } from "@/lib/api";
import { setTheme } from "./actions";

export const metadata = { title: "Runtime data" };

async function CachedByTheme({ theme }: { theme: string }) {
  "use cache";
  cacheLife("hours");
  cacheTag("theme-panel", theme);
  const time = await getTime(`theme-${theme}`);
  return (
    <div
      className={theme === "light" ? "rounded-md bg-zinc-100 p-3 text-zinc-900" : "rounded-md bg-zinc-900 p-3"}
      data-marker="theme-panel"
      data-theme={theme}
    >
      <ServerBadge label={`cached theme=${theme}`} at={time.servedAt} />
      <p className="mt-2 text-sm">
        The cookie was read <strong>outside</strong> this function and passed in. Key = theme string. hit #{time.hit}
      </p>
    </div>
  );
}

async function ThemeSection() {
  const theme = (await cookies()).get("lab-theme")?.value ?? "dark";
  return (
    <div className="space-y-3">
      <CachedByTheme theme={theme} />
      <form action={setTheme} className="flex gap-2">
        <Button name="theme" value="dark" type="submit" variant="outline">
          theme=dark
        </Button>
        <Button name="theme" value="light" type="submit" variant="outline">
          theme=light
        </Button>
      </form>
    </div>
  );
}

async function FreshUuid() {
  await connection();
  const id = crypto.randomUUID();
  return (
    <p className="font-mono text-sm" data-marker="runtime-uuid" data-testid="runtime-uuid">
      {id}
    </p>
  );
}

async function PrivatePanel() {
  "use cache: private";
  cacheLife("minutes");
  const theme = (await cookies()).get("lab-theme")?.value ?? "dark";
  const time = await getTime("private-cache");
  return (
    <div className="text-sm" data-marker="private-cache">
      <ServerBadge label="use cache: private" at={time.servedAt} />
      <p className="mt-2">
        Cookie read <em>inside</em> the private cache. theme={theme}. This is per-user, not a shared CDN entry.
      </p>
      <RenderTimestamp at={time.servedAt} />
    </div>
  );
}

export default function RuntimeDataPage() {
  return (
    <LessonLayout lesson={runtimeData}>
      <DemoSection
        title="1. Pass runtime data in as an argument"
        kind="server"
        description="cookies() is outside. CachedByTheme(theme) keys on the string."
      >
        <Suspense fallback={<p>reading cookie…</p>}>
          <ThemeSection />
        </Suspense>
      </DemoSection>

      <DemoSection title="2. connection() for per-request randomness" kind="server">
        <Suspense fallback={<p>generating…</p>}>
          <FreshUuid />
        </Suspense>
      </DemoSection>

      <DemoSection title="3. 'use cache: private'" kind="server">
        <Suspense fallback={<p>private cache…</p>}>
          <PrivatePanel />
        </Suspense>
      </DemoSection>
    </LessonLayout>
  );
}
