/**
 * Institution types
 * 
 * @module types/institution
 */

// User role types
export type UserRole = 'student' | 'institution_admin' | 'institution_staff' | 'super_admin';

export type InstitutionStatus = 'pending' | 'verified' | 'suspended';

export type ProgramType = 'undergraduate' | 'graduate' | 'certificate' | 'professional';

export type ApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'accepted' 
  | 'rejected' 
  | 'waitlisted'
  | 'withdrawn';

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
  user_id: string | null; // null for global institutions, set for user-created
  created_at?: string;
  courses?: { count: number }[];
  // New fields for official institutions
  status?: InstitutionStatus;
  is_official?: boolean;
  institution_admin_id?: string | null;
  verification_code?: string | null;
  domain?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  description?: string | null;
  contact_email?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null;
  accreditation?: Array<{
    type: string;
    agency: string;
    date: string;
  }> | null;
  metadata?: Record<string, unknown> | null;
}

export interface InstitutionWithStats extends Institution {
  stats?: {
    total_programs: number;
    published_programs: number;
    total_courses: number;
    total_applications: number;
    pending_applications: number;
  };
}

export interface InstitutionSignupData {
  institutionName: string;
  domain: string;
  contactEmail: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  website?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

export interface InstitutionVerificationRequest {
  institutionId: string;
  adminEmail: string;
  verificationCode: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  institution_id: string | null;
  created_at: string;
  updated_at: string;
}
