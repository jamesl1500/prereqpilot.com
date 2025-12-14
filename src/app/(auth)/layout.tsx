import React from 'react';
import Header from '@/components/Header';
import styles from '@/styles/modules/auth/auth.module.scss';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className={styles.authContainer}>
        <div className={styles.backgroundPattern}></div>
        <div className={styles.formCard}>
          {children}
        </div>
      </div>
    </>
  );
}
