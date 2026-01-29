'use client';

import { useState } from 'react';
import SignupForm from '@/components/forms/SignupForm';
import type { SignupFormData } from '@/lib/schemas/auth.schema';
import { signUp } from '@/lib/supabase/auth';
import EmailConfirmation from './EmailConfirmation';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/SignupPage.module.scss';

export default function SignupPage() {
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSignup = async (data: SignupFormData) => {
    setError('');
    setLoading(true);

    try {
      const { user } = await signUp(data);
      
      if (user) {
        setUserEmail(data.email);
        setShowConfirmation(true);
        showToast('Account created! Please check your email.', 'success');
      } else {
        setError('Signup successful, but no user data returned');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to create account');
      showToast((err as Error).message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return <EmailConfirmation email={userEmail} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.contentSection}>
          <h1 className={styles.heading}>
            Plan Your Academic Future with Confidence
          </h1>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Smart Course Planning</h3>
                <p className={styles.featureDescription}>
                  Visualize prerequisites and create optimal course schedules tailored to your goals.
                </p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Track Your Progress</h3>
                <p className={styles.featureDescription}>
                  Monitor completed courses and see what's required to reach your academic milestones.
                </p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Explore Programs</h3>
                <p className={styles.featureDescription}>
                  Discover programs that match your interests and understand their requirements instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.quoteSection}>
          <p className={styles.quote}>
            "PrereqPilot transformed how I plan my semesters. I can see exactly what I need to take and when. It's an absolute game-changer."
          </p>
          <p className={styles.quoteAuthor}>— Sarah Chen, Computer Science Student</p>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <SignupForm onSubmit={handleSignup} isLoading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
