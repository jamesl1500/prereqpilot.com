/**
 * Term types
 * 
 * @module types/term
 */

/**
 * Term structure
 * @interface Term
 */
export interface Term {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

/**
 * Term data structure
 * @interface TermData
 */
export interface TermData {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}
