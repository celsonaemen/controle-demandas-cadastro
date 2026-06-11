import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "min-h-8 px-2.5 py-1.5 text-xs" : "min-h-10 px-4 py-2 text-sm",
        variant === "primary" && "border-primary bg-primary text-primary-foreground hover:bg-emerald-900 dark:hover:bg-emerald-700",
        variant === "secondary" && "border-border bg-white text-slate-900 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:text-white",
        variant === "ghost" && "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
        variant === "danger" && "border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/50",
        className
      )}
      {...props}
    />
  );
}
