import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProgramsClient from './ProgramsClient';
import type { Program } from '@/types/program';

interface Institution {
  id: string;
  name: string;
  short_code: string | null;
  country: string | null;
  status: string;
  is_official: boolean;
  logo_url: string | null;
}

interface ProgramsPageProps {
  user: User;
  programs: Array<Program & { is_official?: boolean | null; institution_id?: string | null; user_id?: string | null }>;
  userInstitutions: Institution[];
  allInstitutions: Institution[];
  onboarding: {
    onboarding_completed: boolean;
    current_step: string | null;
    steps_completed: string[];
  } | null;
}

export default function ProgramsPage({ user, programs, userInstitutions, allInstitutions, onboarding }: ProgramsPageProps) {
  return (
    <DashboardLayout user={user}>
      <ProgramsClient
        programs={programs}
        userInstitutions={userInstitutions}
        allInstitutions={allInstitutions}
        onboarding={onboarding}
      />
    </DashboardLayout>
  );
}
