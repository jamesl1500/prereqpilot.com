'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Institution } from "@/types";
import { User } from "@supabase/supabase-js";

interface InstitutionsPageProps {
  user: User;
  institutions: Institution[];
}

export default function InstitutionsPage({ user, institutions }: InstitutionsPageProps) {

    return (
        <DashboardLayout user={user}>

        </DashboardLayout>
    )
}