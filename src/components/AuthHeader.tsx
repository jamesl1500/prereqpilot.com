'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/modules/components/auth-header.module.scss';

export function AuthHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/primary_logo.png"
            alt="PrereqPilot Logo"
            width={32}
            height={32}
            className={styles.logoImage}
          />
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
