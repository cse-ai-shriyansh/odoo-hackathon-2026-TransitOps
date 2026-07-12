"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/section-header";

export default function SettingsPage(): JSX.Element {
  const [alerts, setAlerts] = useState(true);
  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Profile, preferences, and role-aligned workspace controls." />
      <Card>
        <CardHeader><CardTitle>Workspace preferences</CardTitle><CardDescription>These settings are local mock state for now.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Company</Label><Input defaultValue="TransitOps Logistics" /></div>
          <div className="space-y-2"><Label>Region</Label><Select defaultValue="us-east"><option value="us-east">US East</option><option value="us-west">US West</option><option value="eu-central">EU Central</option></Select></div>
          <div className="space-y-2"><Label>Default role view</Label><Select defaultValue="admin"><option value="admin">Admin</option><option value="fleet_manager">Fleet Manager</option><option value="dispatcher">Dispatcher</option><option value="safety_officer">Safety Officer</option><option value="financial_analyst">Financial Analyst</option></Select></div>
          <div className="space-y-2"><Label>Notification email</Label><Input defaultValue="ops@transitops.test" /></div>
          <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border p-4">
            <div><p className="font-medium">Enable workflow alerts</p><p className="text-sm text-muted-foreground">Receive updates on dispatch, maintenance, and approvals.</p></div>
            <Button variant={alerts ? "default" : "outline"} onClick={() => setAlerts((current) => !current)}>{alerts ? "Enabled" : "Disabled"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
