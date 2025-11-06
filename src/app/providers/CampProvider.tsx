"use client";

import { CampProvider } from "@campnetwork/origin/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function CampProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <CampProvider clientId="9123887d-94f0-4427-a2f7-cd04d16c1fc3">
        {children}
      </CampProvider>
    </QueryClientProvider>
  );
}
