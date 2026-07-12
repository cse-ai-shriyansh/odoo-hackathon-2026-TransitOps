import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>): JSX.Element {
  return <label {...props} className={cn("text-sm font-medium leading-none", className)} />;
}
