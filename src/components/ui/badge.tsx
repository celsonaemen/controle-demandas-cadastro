import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "blue" | "green" | "red" | "yellow" | "slate";
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-xs font-bold",
        tone === "blue" && "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
        tone === "green" && "bg-green-50 text-green-700 dark:bg-emerald-950/60 dark:text-emerald-200",
        tone === "red" && "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-200",
        tone === "yellow" && "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
        tone === "slate" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        className
      )}
      {...props}
    />
  );
}
