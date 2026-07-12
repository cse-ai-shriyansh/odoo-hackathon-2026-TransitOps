import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AppLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
