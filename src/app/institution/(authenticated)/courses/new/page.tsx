import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateCoursePage from './CreateCoursePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add New Course | PrereqPilot',
  description: 'Add a new course to your institution catalog',
};

export default async function NewCourse() {
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

  return <CreateCoursePage institution={institution} />;
}
