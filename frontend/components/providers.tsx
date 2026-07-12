"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
