import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PlansPageClient from './PlansPageClient';

export default async function PlansPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user's academic plans with related data
  const { data: plans } = await supabase
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
    .order('created_at', { ascending: false });

  // Fetch user's institutions for plan creation
  const { data: institutions } = await supabase
    .from('institutions')
    .select('id, name, short_code')
    .order('name');

  // Fetch available programs
  const { data: programs } = await supabase
    .from('program_requirements')
    .select('id, name, institution')
    .order('name');

  return (
    <PlansPageClient
      user={user}
      plans={plans || []}
      institutions={institutions || []}
      programs={programs || []}
    />
  );
}
