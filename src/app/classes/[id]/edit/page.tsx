import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditCourse from './EditCourse';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch course and verify ownership
  const { data: course, error } = await supabase
    .from('taken_courses')
    .select(`*, course:courses(*), institution:institutions(*), term:terms(*)`)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  // Fetch institutions
    const { data: institutions } = await supabase
    .from('institutions')
    .select('id, name')
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order('name', { ascending: true });

  if (error || !course) {
    redirect('/classes');
  }

  return <EditCourse user={user} course={course} institutions={institutions || []} />;
}