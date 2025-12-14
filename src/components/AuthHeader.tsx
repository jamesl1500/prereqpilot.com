'use client';

import Link from 'next/link';
import { PenTool } from 'lucide-react';
import styles from '@/styles/modules/components/auth-header.module.scss';

export function AuthHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <PenTool size={24} strokeWidth={2} />
          <span>PREREQPILOT</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Back to Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
