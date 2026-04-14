"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const buildQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(buildQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
