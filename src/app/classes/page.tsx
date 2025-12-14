import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClassesPage from './ClassesPage';

export default async function Classes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's taken courses with related data
  const { data: takenCourses } = await supabase
    .from('taken_courses')
    .select(`
      *,
      course:courses(*),
      institution:institutions(*),
      term:terms(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch user's terms
  const { data: terms } = await supabase
    .from('terms')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false });

  // Fetch institutions (both global and user's)
  const { data: institutions } = await supabase
    .from('institutions')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('name', { ascending: true });

  // Fetch onboarding status
  const { data: onboarding } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <ClassesPage 
      user={user} 
      takenCourses={takenCourses || []}
      terms={terms || []}
      institutions={institutions || []}
      onboarding={onboarding || null}
    />
  );
}
