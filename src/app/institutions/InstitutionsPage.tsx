import DashboardLayout from "@/components/layout/DashboardLayout";
import { Institution } from "@/types";
import { User } from "@supabase/supabase-js";
import InstitutionsClient from './InstitutionsClient';

interface InstitutionsPageProps {
  user: User;
  userInstitutions: Institution[];
  officialInstitutions: Institution[];
    onboarding: {
        onboarding_completed: boolean;
        current_step: string | null;
        steps_completed: string[];
    } | null;
}

export default function InstitutionsPage({ user, userInstitutions, officialInstitutions, onboarding }: InstitutionsPageProps) {
    return (
        <DashboardLayout user={user}>
            <InstitutionsClient
                userInstitutions={userInstitutions}
                officialInstitutions={officialInstitutions}
                onboarding={onboarding}
            />
        </DashboardLayout>
    );
}