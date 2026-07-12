import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>): JSX.Element {
  return <table {...props} className={cn("w-full caption-bottom text-sm", className)} />;
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>): JSX.Element {
  return <thead {...props} className={cn("[&_tr]:border-b", className)} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>): JSX.Element {
  return <tbody {...props} className={cn("[&_tr:last-child]:border-0", className)} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>): JSX.Element {
  return <tr {...props} className={cn("border-b transition-colors hover:bg-muted/50", className)} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>): JSX.Element {
  return <th {...props} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground", className)} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>): JSX.Element {
  return <td {...props} className={cn("p-4 align-middle", className)} />;
}
