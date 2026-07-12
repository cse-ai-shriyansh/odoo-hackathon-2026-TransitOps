"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createVehicle, deleteVehicle, listVehicles, updateVehicle } from "@/lib/api/vehicles";
import type { Vehicle } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeader } from "@/components/section-header";
import { formatDate, formatNumber } from "@/utils/format";

const vehicleSchema = z.object({
  plateNumber: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(["available", "active_trip", "in_shop", "retired"]),
  capacityKg: z.coerce.number().positive(),
  odometerKm: z.coerce.number().nonnegative(),
  fuelLevel: z.coerce.number().min(0).max(100),
  lastServiceDate: z.string().min(1),
  destination: z.string().min(1),
  eta: z.string().min(1),
  driverId: z.string().nullable().optional(),
  location: z.object({ lat: z.coerce.number(), lng: z.coerce.number() })
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function VehiclesPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: listVehicles });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<keyof Vehicle>("name");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [removing, setRemoving] = useState<Vehicle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plateNumber: "",
      name: "",
      type: "Cargo Truck",
      status: "available",
      capacityKg: 10000,
      odometerKm: 0,
      fuelLevel: 50,
      lastServiceDate: new Date().toISOString(),
      destination: "",
      eta: new Date().toISOString(),
      driverId: null,
      location: { lat: 40.74, lng: -73.98 }
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      if (editing) {
        return updateVehicle(editing.id, values);
      }
      return createVehicle(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setEditing(null);
      form.reset();
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setRemoving(null);
    }
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    return list
      .filter((vehicle) => (status === "all" ? true : vehicle.status === status))
      .filter((vehicle) => {
        const haystack = [vehicle.name, vehicle.plateNumber, vehicle.type, vehicle.destination].join(" ").toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => String(a[sort]).localeCompare(String(b[sort])));
  }, [data, search, sort, status]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openCreate(): void {
    setEditing(null);
    setIsDialogOpen(true);
    form.reset({
      plateNumber: "",
      name: "",
      type: "Cargo Truck",
      status: "available",
      capacityKg: 10000,
      odometerKm: 0,
      fuelLevel: 50,
      lastServiceDate: new Date().toISOString(),
      destination: "",
      eta: new Date().toISOString(),
      driverId: null,
      location: { lat: 40.74, lng: -73.98 }
    });
  }

  function openEdit(vehicle: Vehicle): void {
    setEditing(vehicle);
    setIsDialogOpen(true);
    form.reset(vehicle);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Vehicles" description="Manage fleet records, operational status, and capacity constraints." actionLabel="Add vehicle" onAction={openCreate} actionDisabled={mutation.isLoading} />

      <Card>
        <CardHeader>
          <CardTitle>Fleet Inventory</CardTitle>
          <CardDescription>Search, filter, sort, and paginate through the mock dataset.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicles" className="pl-9" />
            </div>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="active_trip">Active trip</option>
              <option value="in_shop">In shop</option>
              <option value="retired">Retired</option>
            </Select>
            <Select value={sort} onChange={(event) => setSort(event.target.value as keyof Vehicle)}>
              <option value="name">Sort by name</option>
              <option value="plateNumber">Sort by plate</option>
              <option value="capacityKg">Sort by capacity</option>
              <option value="odometerKm">Sort by odometer</option>
            </Select>
          </div>

          {isLoading ? (
            <Skeleton className="h-96 rounded-2xl" />
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No vehicles match the current filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Last service</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.plateNumber} · {vehicle.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={vehicle.status === "available" ? "success" : vehicle.status === "in_shop" ? "warning" : vehicle.status === "retired" ? "muted" : "default"}>
                        {vehicle.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatNumber(vehicle.capacityKg)} kg</TableCell>
                    <TableCell>{vehicle.fuelLevel}%</TableCell>
                    <TableCell>{formatDate(vehicle.lastServiceDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => openEdit(vehicle)}>Edit</Button>
                        <Button variant="destructive" onClick={() => setRemoving(vehicle)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {visible.length} of {filtered.length} vehicles</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Prev</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setIsDialogOpen(false);
          }
        }}>
        <DialogContent onClose={() => { setEditing(null); setIsDialogOpen(false); }}>
          <DialogHeader>
            <DialogTitle>{editing && editing.id ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 p-6 pt-0" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Plate number</Label><Input {...form.register("plateNumber")} /></div>
              <div className="space-y-2"><Label>Name</Label><Input {...form.register("name")} /></div>
              <div className="space-y-2"><Label>Type</Label><Input {...form.register("type")} /></div>
              <div className="space-y-2"><Label>Status</Label><Select {...form.register("status")}><option value="available">Available</option><option value="active_trip">Active trip</option><option value="in_shop">In shop</option><option value="retired">Retired</option></Select></div>
              <div className="space-y-2"><Label>Capacity kg</Label><Input type="number" {...form.register("capacityKg")} /></div>
              <div className="space-y-2"><Label>Fuel level</Label><Input type="number" {...form.register("fuelLevel")} /></div>
              <div className="space-y-2"><Label>Odometer km</Label><Input type="number" {...form.register("odometerKm")} /></div>
              <div className="space-y-2"><Label>Destination</Label><Input {...form.register("destination")} /></div>
              <div className="space-y-2"><Label>Latitude</Label><Input type="number" step="0.0001" {...form.register("location.lat")} /></div>
              <div className="space-y-2"><Label>Longitude</Label><Input type="number" step="0.0001" {...form.register("location.lng")} /></div>
              <div className="space-y-2"><Label>Last service</Label><Input type="datetime-local" {...form.register("lastServiceDate")} /></div>
              <div className="space-y-2"><Label>ETA</Label><Input type="datetime-local" {...form.register("eta")} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => { setEditing(null); setIsDialogOpen(false); }}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Delete vehicle"
        description={`Delete ${removing?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setRemoving(null)}
        onConfirm={() => removing && deleteMutation.mutate(removing.id)}
      />
    </div>
  );
}
