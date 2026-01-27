'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AuthHeader } from '@/components/AuthHeader';
import styles from '@/styles/modules/pages/error-pages.module.scss';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <>
      <AuthHeader />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>500</div>
          <h1 className={styles.title}>Something Went Wrong</h1>
          <p className={styles.description}>
            We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className={styles.errorDetails}>
              <h3>Error Details (Development Only):</h3>
              <pre>{error.message}</pre>
              {error.digest && <p className={styles.digest}>Error ID: {error.digest}</p>}
            </div>
          )}

          <div className={styles.actions}>
            <button onClick={reset} className={styles.primaryButton}>
              Try Again
            </button>
            <Link href="/" className={styles.secondaryButton}>
              Go to Home
            </Link>
            <Link href="/contact" className={styles.tertiaryButton}>
              Contact Support
            </Link>
          </div>

          <div className={styles.info}>
            <h2>What you can try:</h2>
            <ul>
              <li>Refresh the page</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try again in a few minutes</li>
              <li>Contact our support team if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
