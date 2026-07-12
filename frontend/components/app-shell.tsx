"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, ChevronDown, LogOut, Menu, MoonStar, SunMedium } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useTheme } from "@/components/theme/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col">
          <Card className="flex h-full flex-col justify-between border-border/80 bg-background/95 backdrop-blur">
            <div className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold">TransitOps</p>
                  <p className="text-xs text-muted-foreground">Smart transport operations</p>
                </div>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                      pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {pathname === item.href ? <ChevronDown className="h-4 w-4" /> : null}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="space-y-4 border-t border-border p-6">
              <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{session?.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user.email}</p>
                </div>
                <Badge tone="muted">{session ? ROLE_LABELS[session.user.role] : "Guest"}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={toggleTheme}>
                  {theme === "dark" ? <SunMedium className="mr-2 h-4 w-4" /> : <MoonStar className="mr-2 h-4 w-4" />}
                  Theme
                </Button>
                <Button variant="secondary" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="sticky top-4 z-30 rounded-2xl border border-border/80 bg-background/95 px-4 py-3 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <Button variant="ghost" className="h-10 w-10 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <p className="text-sm font-semibold">TransitOps</p>
                  <p className="text-xs text-muted-foreground">Fleet operations</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm text-muted-foreground">{pathname.replace("/", "") || "dashboard"}</p>
                <p className="text-lg font-semibold">{session?.user.name ?? "TransitOps"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="hidden sm:inline-flex" onClick={toggleTheme}>
                  {theme === "dark" ? <SunMedium className="mr-2 h-4 w-4" /> : <MoonStar className="mr-2 h-4 w-4" />}
                  {theme === "dark" ? "Light" : "Dark"}
                </Button>
                <Button variant="ghost" className="h-10 w-10 p-0">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => void logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
