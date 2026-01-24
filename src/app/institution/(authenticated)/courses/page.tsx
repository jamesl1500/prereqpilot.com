import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import CoursesPage from './CoursesPage';

export const metadata = {
  title: 'Course Catalog | PrereqPilot',
  description: 'Manage your institution\'s course catalog',
};

export default async function Page() {
  const cookieStore = await cookies();
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

  return (
    <CoursesPage
      user={user}
      institution={institution}
      courses={courses || []}
    />
  );
}
