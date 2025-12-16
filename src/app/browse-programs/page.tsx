import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BrowseProgramsPage from './BrowseProgramsPage';
import type { Metadata } from 'next';
import type { Institution } from '@/types/institution';

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
  const institutionMap = new Map<string, Institution>();
  if (Array.isArray(userInstitutions)) {
    for (const item of userInstitutions) {
      if (item && typeof item === 'object' && 'institution' in item && item.institution) {
        const inst = item.institution as unknown as Institution;
        if (inst.id) {
          institutionMap.set(inst.id, inst);
        }
      }
    }
  }
  const uniqueUserInstitutions = Array.from(institutionMap.values());

  return (
    <BrowseProgramsPage 
      user={user} 
      programs={programs || []}
      institutions={institutions || []}
      userInstitutions={uniqueUserInstitutions as Institution[]}
    />
  );
}
