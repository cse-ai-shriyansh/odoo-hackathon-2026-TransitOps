import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function SectionHeader({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}): JSX.Element {
  return (
    <Card className="border-border/80 bg-background/90">
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
        {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </div>
    </Card>
  );
}
