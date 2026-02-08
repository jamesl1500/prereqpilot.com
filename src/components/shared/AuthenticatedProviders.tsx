'use client';

import { Suspense, type ReactNode } from 'react';
import { ToastProvider } from '@/components/shared/Toast';
import RouteChangeLoader from '@/components/shared/RouteChangeLoader';

interface AuthenticatedProvidersProps {
  children: ReactNode;
}

export default function AuthenticatedProviders({ children }: AuthenticatedProvidersProps) {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <RouteChangeLoader />
      </Suspense>
      {children}
    </ToastProvider>
  );
}
