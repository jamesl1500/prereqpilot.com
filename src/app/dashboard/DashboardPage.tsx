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

interface DashboardPageProps {
    user: User;
    stats: DashboardStats;
    onboarding: OnboardingData | null;
}

export default function DashboardPage({ user, stats, onboarding }: DashboardPageProps) {
    return (
        <DashboardLayout user={user}>
            <DashboardClient user={user} stats={stats} onboarding={onboarding} />
        </DashboardLayout>
    );
}
