import { InterviewHub } from "@lab/learn-ui/client";
import { modernLessons } from "@lab/learn-ui/content";

export const metadata = { title: "Interview hub" };

export default function InterviewPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Interview hub</h1>
        <p className="max-w-3xl text-zinc-400">
          Cache Components questions. Scores live in this origin&apos;s localStorage (<code>localhost:3001</code>),
          separate from the classic app.
        </p>
      </header>
      <InterviewHub lessons={modernLessons} originNote="modern app · :3001" />
    </div>
  );
}
