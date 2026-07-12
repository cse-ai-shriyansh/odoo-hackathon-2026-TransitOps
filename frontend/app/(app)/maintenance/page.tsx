"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createMaintenance, deleteMaintenance, listMaintenance, updateMaintenance } from "@/lib/api/maintenance";
import type { MaintenanceRecord } from "@/types/domain";
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

const maintenanceSchema = z.object({ vehicleId: z.string().min(1), type: z.string().min(1), status: z.enum(["scheduled", "in_progress", "completed"]), scheduledDate: z.string().min(1), completedDate: z.string().nullable().optional(), vendor: z.string().min(1), cost: z.coerce.number().positive(), notes: z.string().min(1) });
type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

export default function MaintenancePage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["maintenance"], queryFn: listMaintenance });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [removing, setRemoving] = useState<MaintenanceRecord | null>(null);
  const form = useForm<MaintenanceFormValues>({ resolver: zodResolver(maintenanceSchema), defaultValues: { vehicleId: "", type: "", status: "scheduled", scheduledDate: new Date().toISOString(), completedDate: null, vendor: "", cost: 0, notes: "" } });
  const mutation = useMutation({ mutationFn: (values: MaintenanceFormValues) => (editing ? updateMaintenance(editing.id, values) : createMaintenance(values)), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["maintenance"] }); setEditing(null); form.reset(); } });
  const deleteMutation = useMutation({ mutationFn: deleteMaintenance, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["maintenance"] }); setRemoving(null); } });
  const filtered = useMemo(() => (data ?? []).filter((record) => (status === "all" ? true : record.status === status)).filter((record) => [record.type, record.vendor, record.vehicleId].join(" ").toLowerCase().includes(search.toLowerCase())), [data, search, status]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Maintenance" description="Plan, track, and close service events with mock persistence." actionLabel="Add maintenance" onAction={() => { setEditing(null); form.reset(); }} />
      <Card><CardHeader><CardTitle>Service queue</CardTitle><CardDescription>Monitor in-progress and scheduled work.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search maintenance" /></div><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="scheduled">Scheduled</option><option value="in_progress">In progress</option><option value="completed">Completed</option></Select></div>{isLoading ? <Skeleton className="h-80 rounded-2xl" /> : <Table><TableHeader><TableRow><TableHead>Record</TableHead><TableHead>Status</TableHead><TableHead>Cost</TableHead><TableHead>Schedule</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((record) => (<TableRow key={record.id}><TableCell><p className="font-medium">{record.type}</p><p className="text-sm text-muted-foreground">{record.vehicleId} · {record.vendor}</p></TableCell><TableCell><Badge tone={record.status === "completed" ? "success" : record.status === "in_progress" ? "warning" : "default"}>{record.status}</Badge></TableCell><TableCell>{formatCurrency(record.cost)}</TableCell><TableCell>{formatDate(record.scheduledDate)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setEditing(record); form.reset(record); }}>Edit</Button><Button variant="destructive" onClick={() => setRemoving(record)}>Delete</Button></div></TableCell></TableRow>))}</TableBody></Table>}</CardContent></Card>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent onClose={() => setEditing(null)}><DialogHeader><DialogTitle>{editing ? "Edit maintenance" : "Add maintenance"}</DialogTitle></DialogHeader><form className="space-y-4 p-6 pt-0" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Vehicle ID</Label><Input {...form.register("vehicleId")} /></div><div className="space-y-2"><Label>Type</Label><Input {...form.register("type")} /></div><div className="space-y-2"><Label>Status</Label><Select {...form.register("status")}><option value="scheduled">Scheduled</option><option value="in_progress">In progress</option><option value="completed">Completed</option></Select></div><div className="space-y-2"><Label>Cost</Label><Input type="number" {...form.register("cost")} /></div><div className="space-y-2"><Label>Scheduled date</Label><Input type="datetime-local" {...form.register("scheduledDate")} /></div><div className="space-y-2"><Label>Completed date</Label><Input type="datetime-local" {...form.register("completedDate")} /></div><div className="space-y-2"><Label>Vendor</Label><Input {...form.register("vendor")} /></div><div className="space-y-2"><Label>Notes</Label><Input {...form.register("notes")} /></div></div><DialogFooter><Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
      <ConfirmDialog open={Boolean(removing)} title="Delete maintenance record" description={`Delete ${removing?.type}?`} confirmLabel="Delete" onCancel={() => setRemoving(null)} onConfirm={() => removing && deleteMutation.mutate(removing.id)} />
    </div>
  );
}
