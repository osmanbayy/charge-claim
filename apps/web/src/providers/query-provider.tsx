"use client";

import { ReactNode, useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

interface QueryProviderProps {
  children: ReactNode;
}
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.data !== undefined) return;
            toast.error('Veriler yüklenemedi', {
              description: getErrorMessage(error, 'Sayfa verileri alınamadı. Lütfen tekrar deneyin.'),
              id: `query-error-${query.queryHash}`,
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error('İşlem başarısız', {
              description: getErrorMessage(error),
            });
          },
        }),
        defaultOptions: {
          queries: {
            // consider the data curremt for 30 sec.
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
