/**
 * Institution Course Service
 * Handles CRUD operations for institution course catalog
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';

export interface InstitutionCourse {
  id: string;
  institution_id: string;
  course_code: string;
  course_title: string;
  credits: number;
  description: string | null;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all courses for user's institution
 */
export async function getInstitutionCourses(request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get user's institution
  const { data: userInstitution } = await supabase
    .from('institutions')
    .select('id')
    .eq('institution_admin_id', user.id)
    .single();

  if (!userInstitution) {
    return { success: false, error: 'No institution found for user' };
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('institution_id', userInstitution.id)
    .order('course_code', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as InstitutionCourse[] };
}

/**
 * Get a single course by ID
 */
export async function getInstitutionCourse(courseId: string, request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as InstitutionCourse };
}

/**
 * Create a new course
 */
export async function createInstitutionCourse(
  courseData: Partial<InstitutionCourse>,
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get user's institution
  const { data: userInstitution } = await supabase
    .from('institutions')
    .select('id')
    .eq('institution_admin_id', user.id)
    .single();

  if (!userInstitution) {
    return { success: false, error: 'No institution found for user' };
  }

  const { data, error } = await supabase
    .from('courses')
    .insert([{
      ...courseData,
      institution_id: userInstitution.id,
      is_official: true,
    }])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as InstitutionCourse };
}

/**
 * Update a course
 */
export async function updateInstitutionCourse(
  courseId: string,
  courseData: Partial<InstitutionCourse>,
  request: NextRequest
) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('courses')
    .update({
      ...courseData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as InstitutionCourse };
}

/**
 * Delete a course
 */
export async function deleteInstitutionCourse(courseId: string, request: NextRequest) {
  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
