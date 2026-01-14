import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ViewCourse from './ViewCourse';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch the course with related data
  const { data: course, error } = await supabase
    .from('taken_courses')
    .select(`
      *,
      course:courses(*),
      institution:institutions(*),
      term:terms(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !course) {
    redirect('/classes');
  }

  return <ViewCourse user={user} course={course} />;
}
