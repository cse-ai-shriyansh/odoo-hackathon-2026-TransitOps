"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl">{children}</div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div {...props} className={cn("flex items-start justify-between gap-4 border-b border-border p-6", className)} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return <h3 {...props} className={cn("text-lg font-semibold", className)} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return <p {...props} className={cn("text-sm text-muted-foreground", className)} />;
}

export function DialogContent({ className, children, onClose }: { className?: string; children: React.ReactNode; onClose: () => void }): JSX.Element {
  return (
    <div className={cn("max-h-[90vh] overflow-y-auto", className)}>
      <div className="absolute right-4 top-4">
        <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div {...props} className={cn("flex items-center justify-end gap-3 border-t border-border p-6", className)} />;
}
