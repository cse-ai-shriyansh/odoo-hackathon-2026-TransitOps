"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createExpense, deleteExpense, listExpenses, updateExpense } from "@/lib/api/expenses";
import type { Expense } from "@/types/domain";
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

const expenseSchema = z.object({ category: z.enum(["fuel", "maintenance", "tolls", "insurance", "salaries", "other"]), description: z.string().min(1), amount: z.coerce.number().positive(), date: z.string().min(1), status: z.enum(["draft", "submitted", "approved", "rejected"]), tripId: z.string().nullable().optional(), vehicleId: z.string().nullable().optional() });
type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpensesPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["expenses"], queryFn: listExpenses });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [removing, setRemoving] = useState<Expense | null>(null);
  const form = useForm<ExpenseFormValues>({ resolver: zodResolver(expenseSchema), defaultValues: { category: "fuel", description: "", amount: 0, date: new Date().toISOString(), status: "draft", tripId: null, vehicleId: null } });
  const mutation = useMutation({ mutationFn: (values: ExpenseFormValues) => (editing ? updateExpense(editing.id, values) : createExpense(values)), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["expenses"] }); setEditing(null); form.reset(); } });
  const deleteMutation = useMutation({ mutationFn: deleteExpense, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["expenses"] }); setRemoving(null); } });
  const filtered = useMemo(() => (data ?? []).filter((expense) => (status === "all" ? true : expense.status === status)).filter((expense) => [expense.category, expense.description, expense.vehicleId ?? "", expense.tripId ?? ""].join(" ").toLowerCase().includes(search.toLowerCase())), [data, search, status]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Expenses" description="Track operational spending with approval states and linked entities." actionLabel="Add expense" onAction={() => { setEditing(null); form.reset(); }} />
      <Card><CardHeader><CardTitle>Expense ledger</CardTitle><CardDescription>Filter, update, and delete records with mock persistence.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search expenses" /></div><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="rejected">Rejected</option></Select></div>{isLoading ? <Skeleton className="h-80 rounded-2xl" /> : <Table><TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((expense) => (<TableRow key={expense.id}><TableCell><p className="font-medium">{expense.description}</p><p className="text-sm text-muted-foreground">{expense.vehicleId ?? "No vehicle"}</p></TableCell><TableCell>{expense.category}</TableCell><TableCell><Badge tone={expense.status === "approved" ? "success" : expense.status === "submitted" ? "warning" : expense.status === "rejected" ? "danger" : "muted"}>{expense.status}</Badge></TableCell><TableCell>{formatCurrency(expense.amount)}</TableCell><TableCell>{formatDate(expense.date)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setEditing(expense); form.reset(expense); }}>Edit</Button><Button variant="destructive" onClick={() => setRemoving(expense)}>Delete</Button></div></TableCell></TableRow>))}</TableBody></Table>}</CardContent></Card>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent onClose={() => setEditing(null)}><DialogHeader><DialogTitle>{editing ? "Edit expense" : "Add expense"}</DialogTitle></DialogHeader><form className="space-y-4 p-6 pt-0" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Category</Label><Select {...form.register("category")}><option value="fuel">Fuel</option><option value="maintenance">Maintenance</option><option value="tolls">Tolls</option><option value="insurance">Insurance</option><option value="salaries">Salaries</option><option value="other">Other</option></Select></div><div className="space-y-2"><Label>Status</Label><Select {...form.register("status")}><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="rejected">Rejected</option></Select></div><div className="space-y-2 md:col-span-2"><Label>Description</Label><Input {...form.register("description")} /></div><div className="space-y-2"><Label>Amount</Label><Input type="number" {...form.register("amount")} /></div><div className="space-y-2"><Label>Date</Label><Input type="datetime-local" {...form.register("date")} /></div><div className="space-y-2"><Label>Trip ID</Label><Input {...form.register("tripId")} /></div><div className="space-y-2"><Label>Vehicle ID</Label><Input {...form.register("vehicleId")} /></div></div><DialogFooter><Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
      <ConfirmDialog open={Boolean(removing)} title="Delete expense" description={`Delete ${removing?.description}?`} confirmLabel="Delete" onCancel={() => setRemoving(null)} onConfirm={() => removing && deleteMutation.mutate(removing.id)} />
    </div>
  );
}
