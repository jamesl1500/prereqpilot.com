import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CoursesListPage from './CoursesListPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Catalog | PrereqPilot',
  description: 'Manage your institution\'s course catalog',
};

export default async function Page() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's institution
  const { data: userInstitution } = await supabase
    .from('institutions')
    .select('id')
    .eq('institution_admin_id', user.id)
    .single();

  if (!userInstitution) {
    redirect('/institution/setup');
  }

  // Get institution details
  const { data: institution } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', userInstitution.id)
    .single();

  if (!institution) {
    redirect('/institution/setup');
  }

  // Get courses for this institution
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('institution_id', institution.id)
    .order('code');

  // Get course count for stats
  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('institution_id', institution.id);

  return (
    <CoursesListPage
      user={user}
      institution={institution}
      courses={courses || []}
      totalCourses={totalCourses || 0}
    />
  );
}
