/**
 * Program Requirement Service
 * Handles CRUD operations for program requirements, required courses, and course mappings
 */

import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export interface ProgramRequirement {
  id: string;
  user_id: string | null;
  name: string;
  institution: string | null;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
  created_at: string;
}

export interface ProgramRequiredCourse {
  id: string;
  program_requirement_id: string;
  course_title: string;
  course_code: string | null;
  credits: number;
  min_grade: string | null;
  description: string | null;
  category: string | null;
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export interface ProgramCourseMapping {
  id: string;
  user_id: string;
  program_requirement_id: string;
  program_required_course_id: string;
  taken_course_id: string | null;
  is_completed: boolean;
  mapped_at: string;
}

export interface ProgramRequirementWithDetails extends ProgramRequirement {
  required_courses: ProgramRequiredCourse[];
  total_credits: number;
  required_count: number;
  optional_count: number;
}

// ============================================================================
// Program Requirements CRUD
// ============================================================================

export async function getAllProgramRequirements(request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_requirements')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramRequirement[] };
}

export async function getProgramRequirement(id: string, request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_requirements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Check access (user must own it or it's global)
  const program = data as ProgramRequirement;
  if (program.user_id && program.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  return { success: true, data: program };
}

export async function createProgramRequirement(
  programData: Partial<ProgramRequirement>,
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_requirements')
    .insert({
      ...programData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramRequirement };
}

export async function updateProgramRequirement(
  id: string,
  programData: Partial<ProgramRequirement>,
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_requirements')
    .update(programData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramRequirement };
}

export async function deleteProgramRequirement(id: string, request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('program_requirements')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// Program Required Courses CRUD
// ============================================================================

export async function getRequiredCourses(programId: string, request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_required_courses')
    .select('*')
    .eq('program_requirement_id', programId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramRequiredCourse[] };
}

export async function createRequiredCourse(
  courseData: Partial<ProgramRequiredCourse>,
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify user owns the program
  const programCheck = await getProgramRequirement(courseData.program_requirement_id!, request);
  if (!programCheck.success) {
    return programCheck;
  }

  const { data, error } = await supabase
    .from('program_required_courses')
    .insert(courseData)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramRequiredCourse };
}

export async function updateRequiredCourse(
  id: string,
  courseData: Partial<ProgramRequiredCourse>,
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_required_courses')
    .update(courseData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramRequiredCourse };
}

export async function deleteRequiredCourse(id: string, request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('program_required_courses')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// Program Course Mappings CRUD
// ============================================================================

export async function getCourseMappings(programId: string, request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_course_mappings')
    .select(`
      *,
      program_required_course:program_required_courses(*),
      taken_course:taken_courses(*)
    `)
    .eq('program_requirement_id', programId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function createCourseMapping(
  mappingData: {
    program_requirement_id: string;
    program_required_course_id: string;
    taken_course_id?: string | null;
    is_completed: boolean;
  },
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_course_mappings')
    .insert({
      ...mappingData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramCourseMapping };
}

export async function updateCourseMapping(
  requiredCourseId: string,
  mappingData: {
    taken_course_id?: string | null;
    is_completed: boolean;
  },
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('program_course_mappings')
    .update(mappingData)
    .eq('program_required_course_id', requiredCourseId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProgramCourseMapping };
}

export async function deleteCourseMapping(
  requiredCourseId: string,
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('program_course_mappings')
    .delete()
    .eq('program_required_course_id', requiredCourseId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// Helper Functions
// ============================================================================

export async function getProgramWithDetails(
  programId: string,
  request: NextRequest
): Promise<{ success: boolean; data?: ProgramRequirementWithDetails; error?: string }> {
  const programResult = await getProgramRequirement(programId, request);
  if (!programResult.success || !programResult.data) {
    return { success: false, error: programResult.error || 'Program not found' };
  }

  const coursesResult = await getRequiredCourses(programId, request);
  if (!coursesResult.success || !coursesResult.data) {
    return { success: false, error: coursesResult.error || 'Failed to fetch courses' };
  }

  const requiredCourses = coursesResult.data;
  const totalCredits = requiredCourses.reduce((sum, course) => sum + Number(course.credits), 0);
  const requiredCount = requiredCourses.filter(c => c.is_required).length;
  const optionalCount = requiredCourses.filter(c => !c.is_required).length;

  return {
    success: true,
    data: {
      ...programResult.data,
      required_courses: requiredCourses,
      total_credits: totalCredits,
      required_count: requiredCount,
      optional_count: optionalCount,
    },
  };
}
