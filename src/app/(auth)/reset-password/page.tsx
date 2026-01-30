'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ResetPasswordForm from './ResetPasswordForm';
import type { ResetPasswordFormData } from '@/lib/schemas/auth.schema';
import { updatePassword } from '@/lib/supabase/auth';
import { useToast } from '@/components/shared/Toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setError('');
    setLoading(true);

    try {
      await updatePassword(data.password);
      showToast('Password reset successfully!', 'success');
      router.push('/auth/password-updated');
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password');
      showToast((err as Error).message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return <ResetPasswordForm onSubmit={handleSubmit} isLoading={loading} error={error} />;
}
