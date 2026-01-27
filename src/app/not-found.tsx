'use client';

import Link from 'next/link';
import { AuthHeader } from '@/components/AuthHeader';
import styles from '@/styles/modules/pages/error-pages.module.scss';

export default function NotFound() {
  return (
    <>
      <AuthHeader />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.description}>
            Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
          </p>
          
          <div className={styles.suggestions}>
            <h2>Here are some helpful links:</h2>
            <ul>
              <li>
                <Link href="/">Home Page</Link>
              </li>
              <li>
                <Link href="/browse-programs">Browse Programs</Link>
              </li>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/help">Help Center</Link>
              </li>
              <li>
                <Link href="/contact">Contact Support</Link>
              </li>
            </ul>
          </div>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryButton}>
              Go to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className={styles.secondaryButton}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
