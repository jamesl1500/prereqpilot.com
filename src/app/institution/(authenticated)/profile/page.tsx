import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InstitutionProfilePage from './InstitutionProfilePage';

export const metadata = {
  title: 'Institution Profile | PrereqPilot',
  description: 'Manage your institution profile and settings',
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get institution admin's institution
  const { data: institution, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('institution_admin_id', user.id)
    .single();

  if (error || !institution) {
    redirect('/institution/dashboard');
  }

  // Get stats
  const { count: programCount } = await supabase
    .from('program_requirements')
    .select('*', { count: 'exact', head: true })
    .eq('institution', institution.name);

  const { count: courseCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('institution_id', institution.id);

  return (
    <InstitutionProfilePage
      user={user}
      institution={institution}
      stats={{
        programCount: programCount || 0,
        courseCount: courseCount || 0,
      }}
    />
  );
}
