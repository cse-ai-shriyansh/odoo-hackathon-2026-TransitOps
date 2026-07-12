"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-end gap-3 pt-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </CardContent>
      </Card>
    </Dialog>
  );
}
