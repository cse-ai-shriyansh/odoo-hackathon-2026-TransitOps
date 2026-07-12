import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div {...props} className={cn("rounded-2xl border border-border bg-card text-card-foreground shadow-soft", className)} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div {...props} className={cn("flex flex-col gap-1.5 p-6", className)} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return <h3 {...props} className={cn("text-base font-semibold leading-none tracking-tight", className)} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return <p {...props} className={cn("text-sm text-muted-foreground", className)} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div {...props} className={cn("p-6 pt-0", className)} />;
}
