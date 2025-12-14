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
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <ProgramsPage 
      user={user} 
      programs={programs || []}
    />
  );
}
