/**
 * Program data structure
 * 
 * @module types/program
 */

/**
 * Program structure
 * @interface Program
 */
export interface Program {
  id: string;
  name: string;
  institution: string | null;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
}
