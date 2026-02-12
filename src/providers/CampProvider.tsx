"use client";

import { client } from "@/lib/apolloClient";
import { ApolloProvider } from "@apollo/client/react";
import { CampProvider } from "@campnetwork/origin/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export default function CampProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <CampProvider
          clientId="9123887d-94f0-4427-a2f7-cd04d16c1fc3"
          environment="DEVELOPMENT"
          appId="newsroom"
        >
          <Toaster position="bottom-right" />
          {children}
        </CampProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
}
