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

  // Fetch program requirements
  const { data: programs } = await supabase
    .from('program_requirements')
    .select(`
      *,
      required_courses:program_required_courses(*),
      institution:institutions(*)
    `)
    .or(`user_id.is.null,user_id.eq.${user.id}`);

  // Add computed fields to programs
  const programsWithDetails = (programs || []).map(program => ({
    ...program,
    total_credits: program.required_courses?.reduce((sum: number, c: any) => sum + Number(c.credits), 0) || 0,
    required_count: program.required_courses?.filter((c: any) => c.is_required).length || 0,
    optional_count: program.required_courses?.filter((c: any) => !c.is_required).length || 0,
  }));

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

  // Fetch course mappings for all programs
  const mappings: Record<string, any[]> = {};
  for (const program of programsWithDetails) {
    const { data: programMappings } = await supabase
      .from('program_course_mappings')
      .select('*')
      .eq('program_requirement_id', program.id)
      .eq('user_id', user.id);
    
    mappings[program.id] = programMappings || [];
  }

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
      programs={programsWithDetails}
      mappings={mappings}
    />
  );
}
