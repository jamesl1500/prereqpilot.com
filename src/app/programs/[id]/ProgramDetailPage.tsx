import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import type { ProgramRequirementWithDetails } from '@/services/program-requirement-service';
import ProgramDetailClient from './ProgramDetailClient';

interface ProgramDetailPageProps {
  program: ProgramRequirementWithDetails;
  isOwner: boolean;
  user: User;
}

export default function ProgramDetailPage({ program, isOwner, user }: ProgramDetailPageProps) {
  return (
    <DashboardLayout user={user}>
      <ProgramDetailClient program={program} isOwner={isOwner} />
    </DashboardLayout>
  );
}
