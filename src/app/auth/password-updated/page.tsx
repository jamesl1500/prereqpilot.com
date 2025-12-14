import Link from 'next/link';
import styles from '@/styles/modules/auth/verified.module.scss';

export default function PasswordUpdatedPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
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
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.title}>Password Updated!</h1>
        
        <p className={styles.subtitle}>
          Your password has been successfully changed. You can now sign in with your new password.
        </p>

        <Link href="/login" className={styles.continueButton}>
          Sign in to your account
        </Link>
      </div>
    </div>
  );
}
