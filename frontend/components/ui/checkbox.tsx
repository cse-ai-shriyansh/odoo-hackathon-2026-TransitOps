import { cn } from "@/lib/utils";

export function Checkbox({ className, checked, ...props }: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <input
      {...props}
      type="checkbox"
      checked={checked}
      className={cn("h-4 w-4 rounded border-border text-primary focus:ring-primary", className)}
    />
  );
}
