import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProgramDetailPage from './ProgramDetailPage';

export default async function ProgramDetail({
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

  // Check access: official programs are public, non-official programs are only visible to owner
  if (!program.is_official && program.user_id !== user.id) {
    redirect('/programs');
  }

  // Fetch required courses
  const { data: requiredCourses } = await supabase
    .from('program_required_courses')
    .select('*')
    .eq('program_requirement_id', id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  // Calculate stats
  const totalCredits = (requiredCourses || []).reduce((sum, c) => sum + Number(c.credits), 0);
  const requiredCount = (requiredCourses || []).filter(c => c.is_required).length;
  const optionalCount = (requiredCourses || []).filter(c => !c.is_required).length;

  const programWithDetails = {
    ...program,
    required_courses: requiredCourses || [],
    total_credits: totalCredits,
    required_count: requiredCount,
    optional_count: optionalCount,
  };

  const isOwner = program.user_id === user.id;

  return <ProgramDetailPage program={programWithDetails} isOwner={isOwner} user={user} />;
}
