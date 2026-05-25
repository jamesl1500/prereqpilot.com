import React from 'react';
import type { Metadata } from 'next';
import { AuthHeader } from '@/components/AuthHeader';
import { ToastProvider } from '@/components/shared/Toast';
import styles from '@/styles/modules/auth/auth.module.scss';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthHeader />
      <div className={styles.authContainer}>
        <div className={styles.backgroundPattern}></div>
        <div className={styles.formCard}>
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
