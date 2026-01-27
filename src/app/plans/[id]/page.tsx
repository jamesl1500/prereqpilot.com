import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import PlanViewClient from './PlanViewClient';

export const metadata = {
  title: 'View Plan | Prereq Pilot',
  description: 'View and manage your academic plan',
};

export default async function PlanViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch the specific plan with related data
  const { data: plan, error } = await supabase
    .from('academic_plans')
    .select(`
      *,
      institution:institutions(id, name, short_code),
      program:program_requirements(id, name),
      plan_terms(
        *,
        planned_courses(*)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !plan) {
    notFound();
  }

  // Fetch available courses for adding to plans
  const { data: courses } = await supabase
    .from('courses')
    .select('id, code, title, credits, institution_id')
    .order('code')
    .limit(500);

  return (
    <PlanViewClient
      user={user}
      plan={plan}
      courses={courses || []}
    />
  );
}
