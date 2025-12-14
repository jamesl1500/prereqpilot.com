import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScenarioDetailPage from './ScenarioDetailPage';

export default async function ScenarioDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;

  if (!user) {
    redirect('/login');
  }

  // Fetch the scenario
  const { data: scenario } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!scenario) {
    redirect('/scenarios');
  }

  // Fetch user's taken courses
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

  // Fetch scenario overrides/simulated courses
  const { data: scenarioCourses } = await supabase
    .from('scenario_taken_courses')
    .select(`
      *,
      taken_course:taken_courses(
        *,
        course:courses(*),
        institution:institutions(*),
        term:terms(*)
      )
    `)
    .eq('scenario_id', scenario.id);

  return (
    <ScenarioDetailPage 
      user={user}
      scenario={scenario}
      takenCourses={takenCourses || []}
      scenarioCourses={scenarioCourses || []}
    />
  );
}
