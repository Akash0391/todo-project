'use client'

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { SocketProvider } from "@/context/SocketContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider userId="user123">
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </SocketProvider>
    </QueryClientProvider>
  );
} 