import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>The route you requested is not available.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90">
            Go to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
