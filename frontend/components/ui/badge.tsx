import { cn } from "@/lib/utils";

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "danger" | "muted" }): JSX.Element {
  const styles: Record<typeof tone, string> = {
    default: "bg-secondary text-secondary-foreground",
    success: "border border-border bg-background text-foreground",
    warning: "border border-border bg-muted text-foreground",
    danger: "border border-border bg-background text-foreground",
    muted: "bg-muted text-muted-foreground"
  };

  return <span {...props} className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", styles[tone], className)} />;
}
