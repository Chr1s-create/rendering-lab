import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Rendering Lab · classic", template: "%s · Rendering Lab" },
  description: "Learn Next.js rendering by running it: SSG, SSR, ISR, CSR, RSC, streaming, caching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          <Sidebar />
          <main className="min-w-0 flex-1 p-8">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
