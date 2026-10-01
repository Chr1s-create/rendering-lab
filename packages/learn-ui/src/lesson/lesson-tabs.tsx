"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

/**
 * Client component that receives SERVER-rendered panels as props (ReactNode).
 * This is the "pass server components as children/props" pattern: the panels stay
 * server-rendered even though they are placed inside a client component.
 */
export function LessonTabs({
  demo,
  notes,
  tryThis,
  verify,
  interview,
}: Record<"demo" | "notes" | "tryThis" | "verify" | "interview", ReactNode>) {
  return (
    <Tabs defaultValue="demo">
      <TabsList>
        <TabsTrigger value="demo">Demo</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="try">Try this</TabsTrigger>
        <TabsTrigger value="verify">Verify</TabsTrigger>
        <TabsTrigger value="interview">Interview</TabsTrigger>
      </TabsList>
      <TabsContent value="demo">{demo}</TabsContent>
      <TabsContent value="notes">{notes}</TabsContent>
      <TabsContent value="try">{tryThis}</TabsContent>
      <TabsContent value="verify">{verify}</TabsContent>
      <TabsContent value="interview">{interview}</TabsContent>
    </Tabs>
  );
}
