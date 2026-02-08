import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClassesClient from './ClassesClient';
import type { Course, CourseData } from '@/types/course';
import type { InstitutionData, Institution } from '@/types/institution';
import type { TermData, Term } from '@/types/term';

interface OnboardingData {
  onboarding_completed: boolean;
  current_step: string | null;
  steps_completed: string[];
}

type CourseWithDetails = Course & {
  course?: CourseData;
  institution?: InstitutionData;
  term?: TermData;
};

interface ClassesPageProps {
  user: User;
  takenCourses: CourseWithDetails[];
  terms: Term[];
  institutions: Institution[];
  onboarding: OnboardingData | null;
}

export default function ClassesPage({ user, takenCourses, terms, institutions, onboarding }: ClassesPageProps) {
  return (
    <DashboardLayout user={user}>
      <ClassesClient
        takenCourses={takenCourses}
        terms={terms}
        institutions={institutions}
        onboarding={onboarding}
      />
    </DashboardLayout>
  );
}
