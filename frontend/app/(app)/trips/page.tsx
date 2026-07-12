"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTrip, deleteTrip, listTrips, updateTrip } from "@/lib/api/trips";
import type { Trip } from "@/types/domain";
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
import { formatDateTime, formatNumber } from "@/utils/format";

const tripSchema = z.object({
  reference: z.string().min(1),
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  origin: z.string().min(1),
  destination: z.string().min(1),
  cargoDescription: z.string().min(1),
  cargoWeightKg: z.coerce.number().positive(),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  plannedDeparture: z.string().min(1),
  plannedArrival: z.string().min(1),
  notes: z.string().min(1)
});

type TripFormValues = z.infer<typeof tripSchema>;

export default function TripsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["trips"], queryFn: listTrips });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Trip | null>(null);
  const [removing, setRemoving] = useState<Trip | null>(null);
  const form = useForm<TripFormValues>({ resolver: zodResolver(tripSchema), defaultValues: { reference: "", status: "pending", origin: "", destination: "", cargoDescription: "", cargoWeightKg: 0, vehicleId: "", driverId: "", plannedDeparture: new Date().toISOString(), plannedArrival: new Date().toISOString(), notes: "" } });

  const mutation = useMutation({ mutationFn: (values: TripFormValues) => (editing ? updateTrip(editing.id, values) : createTrip(values)), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["trips"] }); setEditing(null); form.reset(); } });
  const deleteMutation = useMutation({ mutationFn: deleteTrip, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["trips"] }); setRemoving(null); } });

  const filtered = useMemo(() => (data ?? []).filter((trip) => (status === "all" ? true : trip.status === status)).filter((trip) => [trip.reference, trip.origin, trip.destination, trip.cargoDescription].join(" ").toLowerCase().includes(search.toLowerCase())), [data, search, status]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Trips" description="Dispatch planning with business-rule-aware assignment inputs." actionLabel="Add trip" onAction={() => { setEditing(null); form.reset(); }} />
      <Card>
        <CardHeader><CardTitle>Trip board</CardTitle><CardDescription>Search by reference, route, or cargo description.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search trips" /></div><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></Select></div>
          {isLoading ? <Skeleton className="h-80 rounded-2xl" /> : (
            <Table><TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Status</TableHead><TableHead>Cargo</TableHead><TableHead>Schedule</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell><p className="font-medium">{trip.reference}</p><p className="text-sm text-muted-foreground">{trip.origin} → {trip.destination}</p></TableCell>
                  <TableCell><Badge tone={trip.status === "active" ? "success" : trip.status === "pending" ? "warning" : trip.status === "cancelled" ? "danger" : "muted"}>{trip.status}</Badge></TableCell>
                  <TableCell>{trip.cargoDescription} · {formatNumber(trip.cargoWeightKg)} kg</TableCell>
                  <TableCell>{formatDateTime(trip.plannedDeparture)} to {formatDateTime(trip.plannedArrival)}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setEditing(trip); form.reset(trip); }}>Edit</Button><Button variant="destructive" onClick={() => setRemoving(trip)}>Delete</Button></div></TableCell>
                </TableRow>
              ))}</TableBody></Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent onClose={() => setEditing(null)}>
          <DialogHeader><DialogTitle>{editing ? "Edit trip" : "Add trip"}</DialogTitle></DialogHeader>
          <form className="space-y-4 p-6 pt-0" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["reference", "Reference"],
                ["origin", "Origin"],
                ["destination", "Destination"],
                ["cargoDescription", "Cargo description"],
                ["vehicleId", "Vehicle ID"],
                ["driverId", "Driver ID"],
                ["plannedDeparture", "Departure", "datetime-local"],
                ["plannedArrival", "Arrival", "datetime-local"],
                ["notes", "Notes", "textarea"]
              ].map(([field, label, type]) => (
                <div key={field} className="space-y-2 md:col-span-1">
                  <Label>{label}</Label>
                  {type === "textarea" ? <textarea className="flex min-h-[110px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" {...form.register(field as keyof TripFormValues)} /> : <Input type={(type as string | undefined) ?? "text"} {...form.register(field as keyof TripFormValues)} />}
                </div>
              ))}
              <div className="space-y-2"><Label>Status</Label><Select {...form.register("status")}><option value="pending">Pending</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></Select></div>
              <div className="space-y-2"><Label>Cargo weight kg</Label><Input type="number" {...form.register("cargoWeightKg")} /></div>
            </div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={Boolean(removing)} title="Delete trip" description={`Delete ${removing?.reference}?`} confirmLabel="Delete" onCancel={() => setRemoving(null)} onConfirm={() => removing && deleteMutation.mutate(removing.id)} />
    </div>
  );
}
