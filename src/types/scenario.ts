/**
 * Scenario data structure
 * 
 * @module types/scenario
 */

/**
 * Scenario structure
 * @interface Scenario
 */
export interface Scenario {
  id: string;
  name: string;
  program_id: string;
  description: string | null;
  created_at?: string;
}
