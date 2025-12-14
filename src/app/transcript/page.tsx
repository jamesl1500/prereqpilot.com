import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TranscriptPage from './TranscriptPage';

export const metadata = {
  title: 'Transcript | Prereq Pilot',
  description: 'View your unofficial transcript organized by institution',
};

export default async function Transcript() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all taken courses with full details
  const { data: takenCourses } = await supabase
    .from('taken_courses')
    .select(`
      *,
      course:courses (
        id,
        code,
        title
      ),
      term:terms (
        id,
        name,
        start_date,
        end_date
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // Fetch institutions (both global and user's)
  const { data: institutions } = await supabase
    .from('institutions')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('name', { ascending: true });

  return (
    <DashboardLayout user={user}>
      <TranscriptPage 
        user={user}
        takenCourses={takenCourses || []}
        institutions={institutions || []}
      />
    </DashboardLayout>
  );
}
