import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import EditCoursePage from './EditCoursePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Course | PrereqPilot',
  description: 'Edit course details',
};

export default async function EditCourse({
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

  return (
    <EditCoursePage course={course} />
  );
}
