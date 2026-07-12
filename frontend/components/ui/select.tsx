import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>): JSX.Element {
  return (
    <select
      {...props}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </select>
  );
}
