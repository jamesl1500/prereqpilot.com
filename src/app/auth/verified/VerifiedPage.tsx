'use client';

import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { AuthHeader } from '@/components/AuthHeader';
import styles from '@/styles/modules/auth/verified.module.scss';
import authStyles from '@/styles/modules/auth/auth.module.scss';

interface VerifiedPageProps {
  user: User;
}

export default function VerifiedPage({ user }: VerifiedPageProps) {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <AuthHeader />
      <div className={authStyles.authContainer}>
        <div className={authStyles.backgroundPattern}></div>
        <div className={authStyles.formCard}>
          <div className={styles.container}>
            <div className={styles.iconWrapper}>
              <svg 
                className={styles.successIcon}
                width="80" 
                height="80" 
                viewBox="0 0 80 80" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="40" cy="40" r="38" stroke="url(#gradient)" strokeWidth="4" fill="none"/>
                <path 
                  d="M25 40L35 50L55 30" 
                  stroke="url(#gradient)" 
                  strokeWidth="5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80">
                    <stop offset="0%" stopColor="#000"/>
                    <stop offset="100%" stopColor="#000"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className={styles.title}>Email Verified!</h1>
            
            <p className={styles.message}>
              Welcome, <strong>{user.email}</strong>!
            </p>
            
            <p className={styles.subtitle}>
              Your email has been successfully verified. You can now access all features of PreReqPilot.
            </p>

            <div className={styles.infoBox}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Account created:</span>
                <span className={styles.infoValue}>
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {user.user_metadata?.name && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name:</span>
                  <span className={styles.infoValue}>{user.user_metadata.name}</span>
                </div>
              )}
            </div>

            <button onClick={handleContinue} className={styles.continueButton}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
