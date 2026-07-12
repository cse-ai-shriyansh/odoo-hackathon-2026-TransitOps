"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserRole } from "@/types/domain";

export function ProtectedRoute({
  children,
  roles
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}): JSX.Element {
  const router = useRouter();
  const { session, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [isLoading, session, router]);

  useEffect(() => {
    if (session && roles && roles.length > 0 && !hasRole(roles)) {
      router.replace("/dashboard");
    }
  }, [hasRole, roles, router, session]);

  if (isLoading || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading session...
      </div>
    );
  }

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Access denied.
      </div>
    );
  }

  return <>{children}</>;
}
