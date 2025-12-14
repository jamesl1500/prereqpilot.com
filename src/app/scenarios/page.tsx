import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScenariosPage from './ScenariosPage';

export default async function Scenarios() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's scenarios
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch onboarding status
  const { data: onboarding } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <ScenariosPage 
      user={user} 
      scenarios={scenarios || []}
      onboarding={onboarding || null}
    />
  );
}
