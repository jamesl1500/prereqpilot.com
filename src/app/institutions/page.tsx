import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstitutionsPage from './InstitutionsPage';

export default async function Institutions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all institutions with course counts
  const { data: institutions } = await supabase
    .from('institutions')
    .select(`
      *,
      courses(count)
    `)
    .order('name', { ascending: true });

  // Fetch onboarding status
  const { data: onboarding } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <InstitutionsPage 
      user={user} 
      institutions={institutions || []}
      onboarding={onboarding || null}
    />
  );
}
