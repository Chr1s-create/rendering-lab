import type { AppProps } from "next/app";
import { PagesSidebar } from "@/components/pages-sidebar";
import "@/app/globals.css";

export default function PagesApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex">
      <PagesSidebar />
      <main className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}
