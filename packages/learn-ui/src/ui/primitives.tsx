import type { ComponentProps } from "react";
import { cn } from "../lib";

// shadcn/ui-style primitives (copied pattern, trimmed). Server-safe: no hooks.

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
const buttonVariants: Record<ButtonVariant, string> = {
  default: "bg-zinc-100 text-zinc-900 hover:bg-zinc-300",
  outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800",
  ghost: "hover:bg-zinc-800",
  destructive: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: "sm" | "md" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-4 text-sm",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-xl border border-zinc-800 bg-zinc-900/60 p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("mb-2 text-sm font-semibold tracking-tight text-zinc-100", className)} {...props} />;
}

type BadgeTone = "server" | "client" | "neutral" | "good" | "bad" | "warn";
const badgeTones: Record<BadgeTone, string> = {
  server: "border-sky-700 bg-sky-950 text-sky-300",
  client: "border-amber-700 bg-amber-950 text-amber-300",
  neutral: "border-zinc-700 bg-zinc-900 text-zinc-300",
  good: "border-emerald-700 bg-emerald-950 text-emerald-300",
  bad: "border-red-700 bg-red-950 text-red-300",
  warn: "border-yellow-700 bg-yellow-950 text-yellow-300",
};

export function Badge({ className, tone = "neutral", ...props }: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre className={cn("whitespace-pre", className)}>
      <code>{code.trim()}</code>
    </pre>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "tip";
  title?: string;
  children: React.ReactNode;
}) {
  const tones = {
    info: "border-sky-800 bg-sky-950/40",
    warn: "border-yellow-800 bg-yellow-950/40",
    tip: "border-emerald-800 bg-emerald-950/40",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-sm", tones[tone])}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-zinc-300 [&_code]:text-zinc-100">{children}</div>
    </div>
  );
}
