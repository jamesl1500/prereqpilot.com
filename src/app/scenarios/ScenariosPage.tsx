import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ScenariosClient from './ScenariosClient';
import type { Scenario } from '@/types/scenario';

interface OnboardingData {
  onboarding_completed: boolean;
  current_step: string | null;
  steps_completed: string[];
}

interface ScenariosPageProps {
  user: User;
  scenarios: Scenario[];
  onboarding: OnboardingData | null;
}

export default function ScenariosPage({ user, scenarios, onboarding }: ScenariosPageProps) {
  return (
    <DashboardLayout user={user}>
      <ScenariosClient scenarios={scenarios} onboarding={onboarding} />
    </DashboardLayout>
  );
}
