import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-primary/20 dark:disabled:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}
