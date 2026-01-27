import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateProgramPage from './CreateProgramPage';

export default async function NewProgram() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get institution admin's institution
  const { data: institution } = await supabase
    .from('institutions')
    .select('*')
    .eq('institution_admin_id', user.id)
    .single();

  if (!institution) {
    redirect('/institution/dashboard');
  }

  return <CreateProgramPage user={user} institution={institution} />;
}
