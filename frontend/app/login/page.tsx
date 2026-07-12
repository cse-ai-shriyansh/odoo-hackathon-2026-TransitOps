"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { APP_NAME, ROLE_LABELS } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"])
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "dana.holt@transitops.test",
      password: "transitops",
      role: "admin"
    }
  });

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setError(null);
    try {
      await login(values);
      router.push("/dashboard");
    } catch {
      setError("Login failed. Please check the mock credentials and try again.");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_25%),linear-gradient(135deg,#0f172a,#111827_45%,#0b1120)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative z-10 max-w-xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">{APP_NAME}</p>
              <p className="text-sm text-white/70">Smart fleet operations</p>
            </div>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight">Operations control for modern transport teams.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
            Dispatch, maintenance, fuel, expenses, and reporting in one mock-backed frontend that is ready to switch to a live backend later.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {Object.values(ROLE_LABELS).map((label) => (
              <Badge key={label} className="bg-white/10 text-white backdrop-blur">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="relative z-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Live map", "Fleet visibility at a glance"],
            ["Mock auth", "Supabase-ready session shape"],
            ["Contract first", "API layer stays stable"]
          ].map(([title, description]) => (
            <Card key={title} className="border-white/10 bg-white/5 text-white backdrop-blur">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-white/70">{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-border/80 bg-background/90 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Use the centralized auth service to enter the mock environment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" {...form.register("role")}> 
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              {error ? <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
              <Button type="submit" className="w-full">
                Continue to dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Mock credentials are accepted through the API layer only. Backend replacement later will not require UI changes.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
