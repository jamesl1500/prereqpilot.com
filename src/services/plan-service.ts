/**
 * Academic Plan Service
 * Handles all academic plan-related operations
 * 
 * @module services/plan-service
 */

import { createClient } from '@/lib/supabase/client';
import type {
  AcademicPlan,
  AcademicPlanWithDetails,
  CreateAcademicPlanData,
  CreatePlanTermData,
  CreatePlannedCourseData,
  PlanTerm,
  PlannedCourse,
} from '@/types/plan';

/**
 * Get all academic plans for the current user
 */
export async function getUserPlans(): Promise<AcademicPlanWithDetails[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
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

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Get a specific academic plan by ID
 */
export async function getPlanById(planId: string): Promise<AcademicPlanWithDetails | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
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
    .eq('id', planId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Create a new academic plan
 */
export async function createPlan(planData: CreateAcademicPlanData): Promise<AcademicPlan> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('academic_plans')
    .insert({
      user_id: user.id,
      ...planData,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update an academic plan
 */
export async function updatePlan(
  planId: string,
  updates: Partial<CreateAcademicPlanData>
): Promise<AcademicPlan> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('academic_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete an academic plan
 */
export async function deletePlan(planId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('academic_plans')
    .delete()
    .eq('id', planId);

  if (error) throw new Error(error.message);
}

/**
 * Set a plan as active (and deactivate others)
 */
export async function setActivePlan(planId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Deactivate all plans
  await supabase
    .from('academic_plans')
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Activate the selected plan
  const { error } = await supabase
    .from('academic_plans')
    .update({ is_active: true })
    .eq('id', planId);

  if (error) throw new Error(error.message);
}

/**
 * Create a new term in a plan
 */
export async function createPlanTerm(
  planId: string,
  termData: CreatePlanTermData
): Promise<PlanTerm> {
  const supabase = createClient();
  
  // Get the next display order
  const { data: existingTerms } = await supabase
    .from('plan_terms')
    .select('display_order')
    .eq('plan_id', planId)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = existingTerms && existingTerms.length > 0 
    ? existingTerms[0].display_order + 1 
    : 0;

  const { data, error } = await supabase
    .from('plan_terms')
    .insert({
      plan_id: planId,
      ...termData,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update a plan term
 */
export async function updatePlanTerm(
  termId: string,
  updates: Partial<CreatePlanTermData>
): Promise<PlanTerm> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('plan_terms')
    .update(updates)
    .eq('id', termId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a plan term
 */
export async function deletePlanTerm(termId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('plan_terms')
    .delete()
    .eq('id', termId);

  if (error) throw new Error(error.message);
}

/**
 * Reorder plan terms
 */
export async function reorderPlanTerms(termOrders: { id: string; display_order: number }[]): Promise<void> {
  const supabase = createClient();
  
  const updates = termOrders.map(({ id, display_order }) =>
    supabase
      .from('plan_terms')
      .update({ display_order })
      .eq('id', id)
  );

  await Promise.all(updates);
}

/**
 * Add a course to a plan term
 */
export async function addPlannedCourse(
  termId: string,
  courseData: CreatePlannedCourseData
): Promise<PlannedCourse> {
  const supabase = createClient();
  
  // Get the next display order
  const { data: existingCourses } = await supabase
    .from('planned_courses')
    .select('display_order')
    .eq('plan_term_id', termId)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = existingCourses && existingCourses.length > 0
    ? existingCourses[0].display_order + 1
    : 0;

  const { data, error } = await supabase
    .from('planned_courses')
    .insert({
      plan_term_id: termId,
      ...courseData,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update a planned course
 */
export async function updatePlannedCourse(
  courseId: string,
  updates: Partial<CreatePlannedCourseData>
): Promise<PlannedCourse> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('planned_courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a planned course
 */
export async function deletePlannedCourse(courseId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('planned_courses')
    .delete()
    .eq('id', courseId);

  if (error) throw new Error(error.message);
}

/**
 * Mark a planned course as completed
 */
export async function markCourseCompleted(
  courseId: string,
  isCompleted: boolean,
  takenCourseId?: string
): Promise<PlannedCourse> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('planned_courses')
    .update({
      is_completed: isCompleted,
      taken_course_id: takenCourseId || null,
    })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Move a course to a different term
 */
export async function moveCourseToTerm(
  courseId: string,
  newTermId: string
): Promise<PlannedCourse> {
  const supabase = createClient();
  
  // Get the next display order in the new term
  const { data: existingCourses } = await supabase
    .from('planned_courses')
    .select('display_order')
    .eq('plan_term_id', newTermId)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = existingCourses && existingCourses.length > 0
    ? existingCourses[0].display_order + 1
    : 0;

  const { data, error } = await supabase
    .from('planned_courses')
    .update({
      plan_term_id: newTermId,
      display_order: nextOrder,
    })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get total credits for a term
 */
export async function getTermCredits(termId: string): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('planned_courses')
    .select('credits')
    .eq('plan_term_id', termId);

  if (error) throw new Error(error.message);
  
  return data?.reduce((sum, course) => sum + course.credits, 0) || 0;
}
