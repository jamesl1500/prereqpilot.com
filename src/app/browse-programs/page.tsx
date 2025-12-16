import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BrowseProgramsPage from './BrowseProgramsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Programs - PrereqPilot',
  description: 'Discover academic programs from institutions nationwide. Check eligibility and plan your academic journey.',
};

export default async function BrowsePrograms() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all verified institutions
  const { data: institutions } = await supabase
    .from('institutions')
    .select('*')
    .eq('is_official', true)
    .eq('status', 'verified')
    .order('name');

  // Fetch all published programs from verified institutions
  const { data: programs } = await supabase
    .from('program_requirements')
    .select(`
      *,
      institution:institutions(*)
    `)
    .eq('is_official', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // Get user's institutions (from taken courses)
  const { data: userInstitutions } = await supabase
    .from('taken_courses')
    .select('institution:institutions(*)')
    .eq('user_id', user.id)
    .not('institution_id', 'is', null);

  // Deduplicate user institutions
  const uniqueUserInstitutions = Array.from(
    new Map(
      userInstitutions
        ?.filter((tc: any) => tc.institution)
        .map((tc: any) => [tc.institution.id, tc.institution]) || []
    ).values()
  );

  return (
    <BrowseProgramsPage 
      user={user} 
      programs={programs || []}
      institutions={institutions || []}
      userInstitutions={uniqueUserInstitutions}
    />
  );
}
