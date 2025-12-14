/**
 * Institution types
 * 
 * @module types/institution
 */

/**
 * Basic Institution data structure
 * @interface InstitutionData
 */
export interface InstitutionData {
  id: string;
  name: string;
  short_code: string;
}

/**
 * Institution structure
 * @interface Institution
 */
export interface Institution {
  id: string;
  name: string;
  short_code: string;
  country: string | null;
  website: string | null;
  created_at?: string;
  courses?: { count: number }[];
}
