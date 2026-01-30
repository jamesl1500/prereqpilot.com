'use client';

import { useState } from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';
import type { ForgotPasswordFormData } from '@/lib/schemas/auth.schema';
import { requestPasswordReset } from '@/lib/supabase/auth';
import { useToast } from '@/components/shared/Toast';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(data.email);
      setEmail(data.email);
      setEmailSent(true);
      showToast('Password reset email sent!', 'success');
    } catch (err) {
      setError((err as Error).message || 'Failed to send reset email');
      showToast((err as Error).message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="reset-confirmation">
        <div className="icon-wrapper">
          <svg 
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
        <h2 className="title">Check your email</h2>
        <p className="message">
          We&apos;ve sent a password reset link to:
        </p>
        <p className="email">{email}</p>
        <p className="instructions">
          Click the link in the email to reset your password. The link will expire in 1 hour.
        </p>
        <style jsx>{`
          .reset-confirmation {
            width: 100%;
            max-width: 480px;
            text-align: center;
          }
          .icon-wrapper {
            margin-bottom: 2rem;
          }
          .title {
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }
          .message {
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          .email {
            font-size: 1.125rem;
            font-weight: 600;
            color: #3b82f6;
            margin-bottom: 1.5rem;
            word-break: break-word;
          }
          .instructions {
            color: #6b7280;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }

  return <ForgotPasswordForm onSubmit={handleSubmit} isLoading={loading} error={error} />;
}
