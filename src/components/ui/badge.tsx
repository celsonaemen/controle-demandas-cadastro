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
        tone === "blue" && "bg-blue-50 text-blue-800",
        tone === "green" && "bg-green-50 text-green-700",
        tone === "red" && "bg-red-50 text-red-700",
        tone === "yellow" && "bg-amber-50 text-amber-700",
        tone === "slate" && "bg-slate-100 text-slate-700",
        className
      )}
      {...props}
    />
  );
}
