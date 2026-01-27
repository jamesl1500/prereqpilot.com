/**
 * Academic Plan types
 * 
 * @module types/plan
 */

export type TermType = 'Fall' | 'Spring' | 'Summer' | 'Winter' | 'Session';

/**
 * Academic Plan structure
 * @interface AcademicPlan
 */
export interface AcademicPlan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  institution_id: string | null;
  program_id: string | null;
  start_date: string | null;
  target_graduation_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Plan Term structure (semester/quarter within a plan)
 * @interface PlanTerm
 */
export interface PlanTerm {
  id: string;
  plan_id: string;
  name: string;
  term_type: TermType | null;
  year: number | null;
  start_date: string | null;
  end_date: string | null;
  credits_target: number | null;
  display_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Planned Course structure
 * @interface PlannedCourse
 */
export interface PlannedCourse {
  id: string;
  plan_term_id: string;
  course_id: string | null;
  course_title: string;
  course_code: string | null;
  credits: number;
  notes: string | null;
  is_completed: boolean;
  taken_course_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Prerequisite tracking for planned courses
 * @interface PlannedCoursePrerequisite
 */
export interface PlannedCoursePrerequisite {
  id: string;
  planned_course_id: string;
  prerequisite_course_id: string | null;
  prerequisite_title: string;
  prerequisite_code: string | null;
  is_satisfied: boolean;
  satisfied_by_taken_course_id: string | null;
  satisfied_by_planned_course_id: string | null;
  created_at: string;
}

/**
 * Plan Term with courses
 * @interface PlanTermWithCourses
 */
export interface PlanTermWithCourses extends PlanTerm {
  planned_courses: PlannedCourse[];
}

/**
 * Academic Plan with terms and courses
 * @interface AcademicPlanWithDetails
 */
export interface AcademicPlanWithDetails extends AcademicPlan {
  plan_terms: PlanTermWithCourses[];
  institution?: {
    id: string;
    name: string;
    short_code: string | null;
  };
  program?: {
    id: string;
    name: string;
  };
}

/**
 * Data for creating a new academic plan
 * @interface CreateAcademicPlanData
 */
export interface CreateAcademicPlanData {
  name: string;
  description?: string;
  institution_id?: string;
  program_id?: string;
  start_date?: string;
  target_graduation_date?: string;
}

/**
 * Data for creating a new plan term
 * @interface CreatePlanTermData
 */
export interface CreatePlanTermData {
  name: string;
  term_type?: TermType;
  year?: number;
  start_date?: string;
  end_date?: string;
  credits_target?: number;
  notes?: string;
}

/**
 * Data for creating a planned course
 * @interface CreatePlannedCourseData
 */
export interface CreatePlannedCourseData {
  course_id?: string;
  course_title: string;
  course_code?: string;
  credits: number;
  notes?: string;
}
