import { cn } from "@/lib/utils";

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "danger" | "muted" }): JSX.Element {
  const styles: Record<typeof tone, string> = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
    muted: "bg-muted text-muted-foreground"
  };

  return <span {...props} className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", styles[tone], className)} />;
}
