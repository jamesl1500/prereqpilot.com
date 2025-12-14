'use client';

import React from 'react';
import Link from 'next/link';
import { PenTool } from 'lucide-react';
import styles from '@/styles/modules/components/Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <PenTool size={24} strokeWidth={2} />
          <span>PREREQPILOT</span>
        </Link>
        
        <nav className={styles.nav}>
          <Link href="/about" className={styles.navLink}>ABOUT</Link>
          <Link href="/videos" className={styles.navLink}>VIDEOS</Link>
          <Link href="/faq" className={styles.navLink}>FAQ</Link>
          <Link href="/forum" className={styles.navLink}>FORUM</Link>
          <Link href="/web3" className={styles.navLink}>WEB3</Link>
          <Link href="/login" className={styles.signInButton}>SIGN IN</Link>
        </nav>
      </div>
    </header>
  );
}
