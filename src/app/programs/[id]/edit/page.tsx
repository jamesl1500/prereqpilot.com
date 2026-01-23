import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProgramEditPage from './ProgramEditPage';

export default async function ProgramEdit({
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

  // Fetch program requirement
  const { data: program, error } = await supabase
    .from('program_requirements')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !program) {
    redirect('/programs');
  }

  // Check ownership
  if (!program.user_id || program.user_id !== user.id) {
    redirect('/programs');
  }

  // Fetch required courses
  const { data: requiredCourses } = await supabase
    .from('program_required_courses')
    .select('*')
    .eq('program_requirement_id', id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  // Fetch user-created institutions
  const { data: userInstitutions } = await supabase
    .from('institutions')
    .select('id, name, short_code, country, website, user_id, is_official, status')
    .eq('user_id', user.id)
    .order('name');

  // Fetch official/verified institutions
  const { data: officialInstitutions } = await supabase
    .from('institutions')
    .select('id, name, short_code, country, website, user_id, is_official, status')
    .eq('is_official', true)
    .eq('status', 'verified')
    .order('name');

  return (
    <ProgramEditPage
      program={program}
      requiredCourses={requiredCourses || []}
      user={user}
      userInstitutions={userInstitutions || []}
      officialInstitutions={officialInstitutions || []}
    />
  );
}
