"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createDriver, deleteDriver, listDrivers, updateDriver } from "@/lib/api/drivers";
import type { Driver } from "@/types/domain";
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
import { formatDate } from "@/utils/format";

const driverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  status: z.enum(["available", "assigned", "suspended"]),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.string().min(1),
  assignedVehicleId: z.string().nullable().optional(),
  homeBase: z.string().min(1)
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function DriversPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["drivers"], queryFn: listDrivers });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Driver | null>(null);
  const [removing, setRemoving] = useState<Driver | null>(null);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      role: "Driver",
      status: "available",
      licenseNumber: "",
      licenseExpiry: new Date().toISOString(),
      assignedVehicleId: null,
      homeBase: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: DriverFormValues) => (editing ? updateDriver(editing.id, values) : createDriver(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setEditing(null);
      form.reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setRemoving(null);
    }
  });

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter((driver) => (status === "all" ? true : driver.status === status))
      .filter((driver) => [driver.name, driver.email, driver.role, driver.homeBase].join(" ").toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, search, status]);

  function openEdit(driver: Driver): void {
    setEditing(driver);
    form.reset(driver);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Drivers" description="Track availability, license status, and assignment readiness." actionLabel="Add driver" onAction={() => { setEditing(null); form.reset(); }} />
      <Card>
        <CardHeader><CardTitle>Driver roster</CardTitle><CardDescription>Filter by availability and maintain assignment hygiene.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search drivers" /></div>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="available">Available</option><option value="assigned">Assigned</option><option value="suspended">Suspended</option></Select>
          </div>
          {isLoading ? <Skeleton className="h-80 rounded-2xl" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Driver</TableHead><TableHead>Status</TableHead><TableHead>License expiry</TableHead><TableHead>Base</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell><p className="font-medium">{driver.name}</p><p className="text-sm text-muted-foreground">{driver.email} · {driver.phone}</p></TableCell>
                  <TableCell><Badge tone={driver.status === "available" ? "success" : driver.status === "assigned" ? "default" : "danger"}>{driver.status}</Badge></TableCell>
                  <TableCell>{formatDate(driver.licenseExpiry)}</TableCell>
                  <TableCell>{driver.homeBase}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => openEdit(driver)}>Edit</Button><Button variant="destructive" onClick={() => setRemoving(driver)}>Delete</Button></div></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent onClose={() => setEditing(null)}>
          <DialogHeader><DialogTitle>{editing ? "Edit driver" : "Add driver"}</DialogTitle></DialogHeader>
          <form className="space-y-4 p-6 pt-0" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Name</Label><Input {...form.register("name")} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" {...form.register("email")} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input {...form.register("phone")} /></div>
              <div className="space-y-2"><Label>Role</Label><Input {...form.register("role")} /></div>
              <div className="space-y-2"><Label>Status</Label><Select {...form.register("status")}><option value="available">Available</option><option value="assigned">Assigned</option><option value="suspended">Suspended</option></Select></div>
              <div className="space-y-2"><Label>License number</Label><Input {...form.register("licenseNumber")} /></div>
              <div className="space-y-2"><Label>License expiry</Label><Input type="datetime-local" {...form.register("licenseExpiry")} /></div>
              <div className="space-y-2"><Label>Home base</Label><Input {...form.register("homeBase")} /></div>
            </div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={Boolean(removing)} title="Delete driver" description={`Delete ${removing?.name}?`} confirmLabel="Delete" onCancel={() => setRemoving(null)} onConfirm={() => removing && deleteMutation.mutate(removing.id)} />
    </div>
  );
}
