'use client';

import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types/institution';
import Link from 'next/link';
import styles from '@/styles/modules/pages/institution-pending.module.scss';

interface InstitutionPendingPageProps {
  institution: Institution;
  user: User;
}

export function InstitutionPendingPage({ institution, user }: InstitutionPendingPageProps) {
  // Determine verification status
  const isEmailVerified = !!user.email_confirmed_at;
  const isInstitutionApproved = institution.status === 'verified';
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          {/* Status Icon */}
          <div className={styles.iconWrapper}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>

          {/* Header */}
          <h1 className={styles.title}>Verification Pending</h1>
          <p className={styles.subtitle}>
            Thank you for registering <strong>{institution.name}</strong> with PrereqPilot
          </p>

          {/* Status Information */}
          <div className={styles.statusBox}>
            <div className={styles.statusItem}>
              <span className={styles.label}>Institution Name:</span>
              <span className={styles.value}>{institution.name}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.label}>Domain:</span>
              <span className={styles.value}>{institution.domain}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.label}>Contact Email:</span>
              <span className={styles.value}>{institution.contact_email}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.value} ${styles.pending}`}>Pending Verification</span>
            </div>
          </div>

          {/* Verification Process */}
          <div className={styles.processSection}>
            <h2 className={styles.sectionTitle}>Verification Process</h2>
            <div className={styles.steps}>
              {/* Step 1: Registration - Always Completed */}
              <div className={`${styles.step} ${styles.completed}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Registration Submitted</h3>
                  <p>Your institution information has been received</p>
                </div>
              </div>
              
              {/* Step 2: Email Verification */}
              <div className={`${styles.step} ${isEmailVerified ? styles.completed : styles.active}`}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Email Verification</h3>
                  <p>
                    {isEmailVerified 
                      ? 'Your email has been verified' 
                      : 'Please check your email and verify your account'}
                  </p>
                </div>
              </div>
              
              {/* Step 3: Admin Review */}
              <div className={`${styles.step} ${isInstitutionApproved ? styles.completed : isEmailVerified ? styles.active : ''}`}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Admin Review</h3>
                  <p>
                    {isInstitutionApproved 
                      ? 'Your institution has been approved' 
                      : isEmailVerified 
                        ? 'Our team is reviewing your institution details' 
                        : 'Our team will review your institution details'}
                  </p>
                </div>
              </div>
              
              {/* Step 4: Account Activation - Only show active when both conditions are met */}
              <div className={`${styles.step} ${isEmailVerified && isInstitutionApproved ? styles.active : ''}`}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h3>Account Activation</h3>
                  <p>
                    {isEmailVerified && isInstitutionApproved 
                      ? 'Your institution portal is ready to be activated' 
                      : 'Your institution portal will be activated'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>What Happens Next?</h2>
            <ul className={styles.infoList}>
              {!isEmailVerified && (
                <>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Check your email ({user.email}) for a verification link
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Click the link to verify your email address
                  </li>
                </>
              )}
              {isEmailVerified && !isInstitutionApproved && (
                <>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Our team is reviewing your institution details
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    You'll receive an email when your account is approved
                  </li>
                </>
              )}
              {isEmailVerified && isInstitutionApproved && (
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Your institution portal is ready! You can now access your dashboard.
                </li>
              )}
            </ul>
          </div>

          {/* Estimated Time - Only show if not fully approved */}
          {!(isEmailVerified && isInstitutionApproved) && (
            <div className={styles.timelineBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <div>
                <strong>Estimated Review Time:</strong> 1-2 business days
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className={styles.supportSection}>
            <p>
              Have questions or need assistance? Contact our support team at{' '}
              <a href="mailto:support@prereqpilot.com">support@prereqpilot.com</a>
            </p>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {isEmailVerified && isInstitutionApproved ? (
              <Link href="/institution/dashboard" className={styles.homeButton}>
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/" className={styles.homeButton}>
                Return to Home
              </Link>
            )}
            <button
              className={styles.refreshButton}
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
