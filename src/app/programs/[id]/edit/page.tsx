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

  return (
    <ProgramEditPage
      program={program}
      requiredCourses={requiredCourses || []}
      user={user}
    />
  );
}
