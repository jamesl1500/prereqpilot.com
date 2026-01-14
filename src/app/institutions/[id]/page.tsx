import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ViewInstitutionPage from './ViewInstitutionPage';

export default async function ViewInstitution({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch institution
  const { data: institution, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !institution) {
    redirect('/institutions');
  }

  // Check if user owns this institution (for custom institutions)
  const isOwner = institution.user_id === user.id;

  // If it's a custom institution and user doesn't own it, redirect
  if (institution.user_id && !isOwner) {
    redirect('/institutions');
  }

  // Fetch courses from this institution that the user has taken
  const { data: userCourses } = await supabase
    .from('taken_courses')
    .select(`
      *,
      term:terms(*)
    `)
    .eq('user_id', user.id)
    .eq('institution_id', id)
    .order('term_id', { ascending: true });

  // Fetch official courses from this institution (if it's an official institution)
  let officialCourses = [];
  if (institution.is_official) {
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .eq('institution_id', id)
      .eq('is_official', true)
      .order('code', { ascending: true })
      .limit(50);
    
    officialCourses = courses || [];
  }

  // Fetch programs from this institution (if any)
  const { data: programs } = await supabase
    .from('program_requirements')
    .select('*')
    .eq('institution_id', id)
    .order('name', { ascending: true });

  return (
    <ViewInstitutionPage 
      user={user} 
      institution={institution}
      isOwner={isOwner}
      userCourses={userCourses || []}
      officialCourses={officialCourses}
      programs={programs || []}
    />
  );
}
