'use client';

import { useState } from 'react';
import SignupForm from '@/components/forms/SignupForm';
import type { SignupFormData } from '@/lib/schemas/auth.schema';
import { signUp } from '@/lib/supabase/auth';
import EmailConfirmation from './EmailConfirmation';

export default function SignupPage() {
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
      } else {
        setError('Signup successful, but no user data returned');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return <EmailConfirmation email={userEmail} />;
  }

  return <SignupForm onSubmit={handleSignup} isLoading={loading} error={error} />;
}
