import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardClient from './DashboardClient';

interface DashboardStats {
    totalCourses: number;
    totalCredits: number;
    totalTerms: number;
    overallGPA: number | null;
    prereqGPA: number | null;
}

interface OnboardingData {
    onboarding_completed: boolean;
    current_step: string | null;
    steps_completed: string[];
}

interface RequiredCourse {
  id: string;
  course_title: string;
  is_required: boolean;
  min_grade: string | null;
  credits: number;
}

interface Program {
  id: string;
  name: string;
  min_overall_gpa: number | null;
  min_prereq_gpa: number | null;
  institution: { name: string; short_code: string | null } | null;
  program_required_courses: RequiredCourse[];
}

interface TakenCourse {
  id: string;
  course_title: string;
  credits: number;
  grade_value: number | null;
}

interface DashboardPageProps {
    user: User;
    stats: DashboardStats;
    onboarding: OnboardingData | null;
    programs: Program[];
    takenCourses: TakenCourse[];
    scenarioCount: number;
}

export default function DashboardPage({ user, stats, onboarding, programs, takenCourses, scenarioCount }: DashboardPageProps) {
    return (
        <DashboardLayout user={user}>
            <DashboardClient
              user={user}
              stats={stats}
              onboarding={onboarding}
              programs={programs}
              takenCourses={takenCourses}
              scenarioCount={scenarioCount}
            />
        </DashboardLayout>
    );
}
