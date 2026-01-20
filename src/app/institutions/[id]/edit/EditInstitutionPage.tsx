'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Institution } from "@/types";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import styles from '@/styles/modules/pages/edit-institution.module.scss';
import { ArrowLeft, Building2 } from "lucide-react";

interface EditInstitutionPageProps{
    user: User;
    institution: Institution;
}

export default function EditInstitutionPage({user, institution}: EditInstitutionPageProps)
{
    const router = useRouter();

    return (
        <DashboardLayout user={user}>
            <div className={styles.container}>
                {/* Back Button */}
                <button onClick={() => router.push('/institutions')} className={styles.backButton}>
                    <ArrowLeft size={20} />
                    Back to Institutions
                </button>

                {/* Page header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.iconWrapper}>
                            <Building2 size={48} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className={styles.headerTop}>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}