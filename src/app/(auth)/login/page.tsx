'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/forms/LoginForm';
import type { LoginFormData } from '@/lib/schemas/auth.schema';
import { signIn } from '@/lib/supabase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      await signIn(data);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={loading} error={error} />;
}
