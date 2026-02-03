import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProgramsPage from './ProgramsPage';

export default async function Programs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch program requirements with prerequisite groups
  const { data: programs } = await supabase
    .from('program_requirements')
    .select(`
      *,
      prereq_groups(
        *,
        prereq_group_courses(
          course:courses(*)
        )
      ),
      institution:institutions(*)
    `)
    .order('created_at', { ascending: false });

  // Fetch user's institution
  const { data: userInstitutions } = await supabase
    .from('institutions')
    .select('*')
    .eq('user_id', user.id)

  // Fetch all verified institutions (only if feature enabled)
  let allInstitutions = [];
  if (process.env.NEXT_ENABLE_OFFICIAL_INSTITUTIONS === 'true') {
    const { data } = await supabase
      .from('institutions')
      .select('*')
      .eq('is_official', true)
      .eq('status', 'verified')
      .order('name');
    allInstitutions = data || [];
  }

  return (
    <ProgramsPage 
      user={user} 
      programs={programs || []}
      userInstitutions={userInstitutions || []}
      allInstitutions={allInstitutions || []}
    />
  );
}
