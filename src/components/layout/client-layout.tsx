"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const query_client = new QueryClient();

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={query_client}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}