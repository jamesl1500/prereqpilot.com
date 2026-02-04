import Link from 'next/link';
import { AuthHeader } from '@/components/AuthHeader';
import styles from '@/styles/modules/auth/error.module.scss';
import authStyles from '@/styles/modules/auth/auth.module.scss';

export default function AuthErrorPage() {
  return (
    <>
      <AuthHeader />
      <div className={authStyles.authContainer}>
        <div className={authStyles.backgroundPattern}></div>
        <div className={`${authStyles.formCard} ${styles.card}`}>
          <div className={styles.iconWrapper}>
            <svg 
              className={styles.errorIcon}
              width="80" 
              height="80" 
              viewBox="0 0 80 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="38" stroke="#ef4444" strokeWidth="4" fill="none"/>
              <path 
                d="M30 30L50 50M50 30L30 50" 
                stroke="#ef4444" 
                strokeWidth="5" 
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className={styles.title}>Verification Failed</h1>
          
          <p className={styles.message}>
            We couldn&apos;t verify your email address. This could be due to:
          </p>
          
          <ul className={styles.reasonList}>
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>The link is invalid or corrupted</li>
          </ul>

          <div className={styles.actions}>
            <Link href="/signup" className={styles.primaryButton}>
              Sign Up Again
            </Link>
            <Link href="/login" className={styles.secondaryButton}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
