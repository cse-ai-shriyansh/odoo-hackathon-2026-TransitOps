import { cn } from "@/lib/utils";

export function Tabs({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div {...props} className={cn("flex flex-col gap-4", className)} />;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div {...props} className={cn("inline-flex rounded-xl bg-muted p-1", className)} />;
}

export function TabsTrigger({ active, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }): JSX.Element {
  return (
    <button
      {...props}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition",
        active ? "bg-background shadow-soft" : "text-muted-foreground hover:text-foreground",
        className
      )}
    />
  );
}
