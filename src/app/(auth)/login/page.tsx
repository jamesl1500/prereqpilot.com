'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/forms/LoginForm';
import type { LoginFormData } from '@/lib/schemas/auth.schema';
import { signIn } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      const authData = await signIn(data);
      
      // Check if user is an institution admin and redirect accordingly
      const userRole = authData.user?.user_metadata?.role;
      
      if (userRole === 'institution_admin') {
        // Now check if the institution the user owns is verified
        const supabase = createClient();
        const { data: institution, error } = await supabase
          .from('institutions')
          .select('status')
          .eq('institution_admin_id', authData.user?.id)
          .single();
        
        if (error || !institution || institution.status !== 'verified') {
          router.push('/institution/pending');
          return;
        }
        router.push('/institution/dashboard');
      } else {
        router.push('/dashboard');
      }
      
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={loading} error={error} />;
}
