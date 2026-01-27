import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import EditProgramPage from './EditProgramPage';

export default async function EditProgram({
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

  // Get institution admin's institution
  const { data: institution } = await supabase
    .from('institutions')
    .select('*')
    .eq('institution_admin_id', user.id)
    .single();

  if (!institution) {
    redirect('/institution/dashboard');
  }

  // Get program
  const { data: program, error } = await supabase
    .from('program_requirements')
    .select('*')
    .eq('id', id)
    .eq('institution', institution.name)
    .single();

  if (error || !program) {
    notFound();
  }

  // Get required courses
  const { data: requiredCourses } = await supabase
    .from('program_required_courses')
    .select('*')
    .eq('program_requirement_id', id)
    .order('display_order', { ascending: true });

  // Get institution's course catalog
  const { data: catalogCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('institution_id', institution.id)
    .order('code', { ascending: true });

  return <EditProgramPage user={user} institution={institution} program={program} requiredCourses={requiredCourses || []} catalogCourses={catalogCourses || []} />;
}
