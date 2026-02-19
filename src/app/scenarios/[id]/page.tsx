import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScenarioDetailPage from './ScenarioDetailPage';
import type { ProgramRequirementWithDetails, ProgramRequiredCourse, ProgramCourseMapping } from '@/services/program-requirement-service';

interface ProgramWithRequirements {
  id: string;
  user_id: string | null;
  name: string;
  institution_id: string | null;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
  created_at: string;
  required_courses?: ProgramRequiredCourse[] | null;
  institution?: ProgramRequirementWithDetails['institution'];
  [key: string]: unknown;
}

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
  const programsWithDetails: ProgramRequirementWithDetails[] = (programs || []).map((program: ProgramWithRequirements) => ({
    ...program,
    total_credits: program.required_courses?.reduce((sum, course) => sum + Number(course.credits ?? 0), 0) || 0,
    required_count: program.required_courses?.filter((course) => course.is_required).length || 0,
    optional_count: program.required_courses?.filter((course) => !course.is_required).length || 0,
    required_courses: program.required_courses || [],
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
  const mappings: Record<string, ProgramCourseMapping[]> = {};
  for (const program of programsWithDetails) {
    const { data: programMappings } = await supabase
      .from('program_course_mappings')
      .select('*')
      .eq('program_requirement_id', program.id)
      .eq('user_id', user.id);
    
    mappings[program.id] = (programMappings || []) as ProgramCourseMapping[];
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
