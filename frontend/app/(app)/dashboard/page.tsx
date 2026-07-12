"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Fuel, MapPinned, PackageSearch, TriangleAlert, Truck, UserRound, Wrench } from "lucide-react";
import { getDashboard } from "@/lib/api/dashboard";
import { FleetMap } from "@/components/fleet-map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format";

function KpiCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }): JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}

function SimpleBarChart({
  title,
  description,
  points
}: {
  title: string;
  description: string;
  points: { label: string; value: number }[];
}): JSX.Element {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {points.map((point) => (
          <div key={point.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{point.label}</span>
              <span className="text-muted-foreground">{point.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(point.value / maxValue) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage(): JSX.Element {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  if (isLoading || !data) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Active Vehicles" value={data.kpis.activeVehicles} icon={<Truck className="h-5 w-5" />} />
        <KpiCard title="Available Vehicles" value={data.kpis.availableVehicles} icon={<PackageSearch className="h-5 w-5" />} />
        <KpiCard title="Vehicles In Shop" value={data.kpis.vehiclesInShop} icon={<Wrench className="h-5 w-5" />} />
        <KpiCard title="Active Trips" value={data.kpis.activeTrips} icon={<BarChart3 className="h-5 w-5" />} />
        <KpiCard title="Pending Trips" value={data.kpis.pendingTrips} icon={<TriangleAlert className="h-5 w-5" />} />
        <KpiCard title="Drivers Available" value={data.kpis.driversAvailable} icon={<UserRound className="h-5 w-5" />} />
        <KpiCard title="Fleet Utilization" value={`${data.kpis.fleetUtilization}%`} icon={<MapPinned className="h-5 w-5" />} />
        <KpiCard title="Operational Cost" value={formatCurrency(data.kpis.operationalCost)} icon={<Fuel className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SimpleBarChart title="Trip Status" description="Current workload across the dispatch board." points={data.tripStatus} />
        <SimpleBarChart title="Vehicle Utilization" description="How the fleet is distributed right now." points={data.vehicleUtilization} />
        <SimpleBarChart title="Fuel Consumption" description="Weekly fuel usage trend." points={data.fuelConsumption} />
        <SimpleBarChart title="Maintenance Trend" description="Maintenance demand by month." points={data.maintenanceTrend} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Operational spending split by category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {data.expenseBreakdown.map((item) => (
              <div key={item.label} className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <FleetMap points={data.fleetMap} />
    </div>
  );
}
