'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PenTool } from 'lucide-react';
import styles from '@/styles/modules/components/public-header.module.scss';

import type { User } from '@supabase/supabase-js';

interface PublicHeaderProps {
  user?: User | null;
}

export function PublicHeader({ user }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <PenTool size={24} strokeWidth={2} />
          <span>PREREQPILOT</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link href="/programs" className={styles.navLink}>
            Programs
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/help" className={styles.navLink}>
            Help
          </Link>
          <Link href="/forinstitutions" className={styles.navLink}>
            For Institutions
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className={styles.actions}>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.dashboardButton}>
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className={styles.signOutButton}>
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/signup" className={styles.signupButton}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link
            href="/programs"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Programs
          </Link>
          <Link
            href="/about"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/help"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Help
          </Link>
          <Link
            href="/institutions"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            For Institutions
          </Link>
          <div className={styles.mobileDivider}></div>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className={styles.mobileSignOutButton}>
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={styles.mobileSignupButton}
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
