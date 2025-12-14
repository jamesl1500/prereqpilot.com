import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VerifiedPage from './VerifiedPage';

export default async function EmailVerifiedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  return <VerifiedPage user={user} />;
}
