import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import ViewCoursePage from './ViewCoursePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'View Course | PrereqPilot',
  description: 'View course details',
};

export default async function CourseDetail({
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

  // Get course
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('institution_id', institution.id)
    .single();

  if (error || !course) {
    notFound();
  }

  // Get programs that use this course
  const { data: programUsages } = await supabase
    .from('program_required_courses')
    .select(`
      id,
      min_grade,
      is_required,
      category,
      program_requirements (
        id,
        name
      )
    `)
    .eq('course_code', course.code);

  return (
    <ViewCoursePage
      user={user}
      institution={institution}
      course={course}
      programUsages={programUsages || []}
    />
  );
}
