'use client';

import Link from 'next/link';
import styles from '@/styles/modules/auth/confirmation.module.scss';

interface EmailConfirmationProps {
  email: string;
}

export default function EmailConfirmation({ email }: EmailConfirmationProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <svg 
          className={styles.emailIcon}
          width="80" 
          height="80" 
          viewBox="0 0 80 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect 
            x="10" 
            y="20" 
            width="60" 
            height="40" 
            rx="4" 
            stroke="url(#gradient)" 
            strokeWidth="3"
            fill="none"
          />
          <path 
            d="M10 25L40 45L70 25" 
            stroke="url(#gradient)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h2 className={styles.title}>Check your email</h2>
      
      <p className={styles.message}>
        We&apos;ve sent a confirmation email to:
      </p>
      
      <p className={styles.email}>{email}</p>
      
      <p className={styles.instructions}>
        Click the confirmation link in the email to verify your account and start using PreReq Pilot.
      </p>

      <div className={styles.infoBox}>
        <p className={styles.infoTitle}>Didn&apos;t receive the email?</p>
        <ul className={styles.tipsList}>
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the correct email address</li>
          <li>Wait a few minutes and check again</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Link href="/login" className={styles.loginLink}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
