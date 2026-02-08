import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstitutionProgramsPage from './InstitutionProgramsPage';

export default async function InstitutionPrograms() {
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

  // Get programs for this institution
  const { data: programs } = await supabase
    .from('program_requirements')
    .select(`
      *,
      program_required_courses(count)
    `)
    .eq('institution', institution.name)
    .order('created_at', { ascending: false });

  return <InstitutionProgramsPage institution={institution} programs={programs || []} />;
}
