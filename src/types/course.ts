/**
 * Course-related types
 * 
 * @module types/course
 */
import type { InstitutionData } from './institution';
import type { TermData } from './term';

/**
 * Course data structure
 * @interface CourseData
 */
export interface CourseData {
  id: string;
  code: string;
  title: string;
  credits: number;
}

/**
 * Course structure
 * @interface Course
 */
export interface Course {
  id: string;
  user_id: string;
  course_id: string | null;
  institution_id: string | null;
  term_id: string | null;
  course_title: string;
  credits: number;
  grade: string | null;
  grade_value: number | null;
  notes: string | null;
  is_retaken?: boolean;
  created_at: string;
  course?: CourseData;
  institution?: InstitutionData;
  term?: TermData;
}

/**
 * Data structure for Course Modal
 * @interface CourseModalData
 */
export interface CourseModalData {
  id: string;
  course_title: string;
  credits: number;
  grade: string | null;
  grade_value: number | null;
  term_id: string | null;
  institution_id: string | null;
  notes: string | null;
}
