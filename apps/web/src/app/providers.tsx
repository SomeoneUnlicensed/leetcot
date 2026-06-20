'use client';

import { SessionProvider } from '@repo/auth/react';
import { TooltipProvider } from '@repo/ui/components/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import React, { Suspense } from 'react';
import { Toolbar } from '~/components/toolbar';
import { ArlistLinkedModal } from './arlist-linked-modal';
import { FeatureFlagProvider } from './feature-flag-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 5000,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <FeatureFlagProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </FeatureFlagProvider>
          <Suspense>
            <Toolbar />
          </Suspense>
          <ArlistLinkedModal />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
