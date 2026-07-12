"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createFuelLog, deleteFuelLog, listFuelLogs, updateFuelLog } from "@/lib/api/fuel";
import type { FuelLog } from "@/types/domain";
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
import { formatCurrency, formatDate } from "@/utils/format";

const fuelSchema = z.object({ vehicleId: z.string().min(1), driverId: z.string().min(1), liters: z.coerce.number().positive(), unitPrice: z.coerce.number().positive(), odometerKm: z.coerce.number().nonnegative(), refuelDate: z.string().min(1), station: z.string().min(1), status: z.enum(["draft", "submitted", "approved"]), totalCost: z.coerce.number().optional() });
type FuelFormValues = z.infer<typeof fuelSchema>;

export default function FuelLogsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["fuelLogs"], queryFn: listFuelLogs });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<FuelLog | null>(null);
  const [removing, setRemoving] = useState<FuelLog | null>(null);
  const form = useForm<FuelFormValues>({ resolver: zodResolver(fuelSchema), defaultValues: { vehicleId: "", driverId: "", liters: 0, unitPrice: 0, odometerKm: 0, refuelDate: new Date().toISOString(), station: "", status: "draft" } });
  const mutation = useMutation({ mutationFn: (values: FuelFormValues) => (editing ? updateFuelLog(editing.id, values) : createFuelLog(values)), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["fuelLogs"] }); setEditing(null); form.reset(); } });
  const deleteMutation = useMutation({ mutationFn: deleteFuelLog, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["fuelLogs"] }); setRemoving(null); } });
  const filtered = useMemo(() => (data ?? []).filter((log) => (status === "all" ? true : log.status === status)).filter((log) => [log.vehicleId, log.driverId, log.station].join(" ").toLowerCase().includes(search.toLowerCase())), [data, search, status]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Fuel Logs" description="Capture refueling events and approval states." actionLabel="Add fuel log" onAction={() => { setEditing(null); form.reset(); }} />
      <Card><CardHeader><CardTitle>Fuel entries</CardTitle><CardDescription>Search, inspect, and maintain accounting-ready log rows.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search fuel logs" /></div><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option></Select></div>{isLoading ? <Skeleton className="h-80 rounded-2xl" /> : <Table><TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Status</TableHead><TableHead>Liters</TableHead><TableHead>Total cost</TableHead><TableHead>Refuel date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((log) => (<TableRow key={log.id}><TableCell><p className="font-medium">{log.vehicleId}</p><p className="text-sm text-muted-foreground">{log.station}</p></TableCell><TableCell><Badge tone={log.status === "approved" ? "success" : log.status === "submitted" ? "warning" : "muted"}>{log.status}</Badge></TableCell><TableCell>{log.liters}</TableCell><TableCell>{formatCurrency(log.totalCost)}</TableCell><TableCell>{formatDate(log.refuelDate)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setEditing(log); form.reset(log); }}>Edit</Button><Button variant="destructive" onClick={() => setRemoving(log)}>Delete</Button></div></TableCell></TableRow>))}</TableBody></Table>}</CardContent></Card>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent onClose={() => setEditing(null)}><DialogHeader><DialogTitle>{editing ? "Edit fuel log" : "Add fuel log"}</DialogTitle></DialogHeader><form className="space-y-4 p-6 pt-0" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Vehicle ID</Label><Input {...form.register("vehicleId")} /></div><div className="space-y-2"><Label>Driver ID</Label><Input {...form.register("driverId")} /></div><div className="space-y-2"><Label>Liters</Label><Input type="number" {...form.register("liters")} /></div><div className="space-y-2"><Label>Unit price</Label><Input type="number" step="0.01" {...form.register("unitPrice")} /></div><div className="space-y-2"><Label>Odometer km</Label><Input type="number" {...form.register("odometerKm")} /></div><div className="space-y-2"><Label>Refuel date</Label><Input type="datetime-local" {...form.register("refuelDate")} /></div><div className="space-y-2"><Label>Station</Label><Input {...form.register("station")} /></div><div className="space-y-2"><Label>Status</Label><Select {...form.register("status")}><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option></Select></div></div><DialogFooter><Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
      <ConfirmDialog open={Boolean(removing)} title="Delete fuel log" description={`Delete entry from ${removing?.station}?`} confirmLabel="Delete" onCancel={() => setRemoving(null)} onConfirm={() => removing && deleteMutation.mutate(removing.id)} />
    </div>
  );
}
