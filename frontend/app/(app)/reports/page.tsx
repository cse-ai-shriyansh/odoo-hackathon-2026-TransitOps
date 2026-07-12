"use client";

import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getReports } from "@/lib/api/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/section-header";

export default function ReportsPage(): JSX.Element {
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: getReports });

  return (
    <ProtectedRoute roles={["admin", "financial_analyst"]}>
      <div className="space-y-6">
        <SectionHeader title="Reports" description="Governed summary views for finance and leadership users." />
        <Card>
          <CardHeader><CardTitle>Operational report</CardTitle><CardDescription>Generated from the mock contract endpoint.</CardDescription></CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-64 rounded-2xl" /> : <pre className="overflow-auto rounded-2xl bg-muted p-4 text-sm">{JSON.stringify(data, null, 2)}</pre>}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
