import { InterviewHub } from "@lab/learn-ui/client";
import { classicLessons } from "@lab/learn-ui/content";

export const metadata = { title: "Interview hub" };

export default function InterviewPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Interview hub</h1>
        <p className="max-w-3xl text-zinc-400">
          Scores are stored in this origin&apos;s localStorage (<code>localhost:3000</code>). Weak topics are those
          below 70% or unfinished. Use the modern app&apos;s hub for Cache Components questions.
        </p>
      </header>
      <InterviewHub lessons={classicLessons} originNote="classic app · :3000" />
    </div>
  );
}
