import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <input
      {...props}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}
