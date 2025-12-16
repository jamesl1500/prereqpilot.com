'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProgramModal from '@/components/modals/ProgramModal';
import DeleteModal from '@/components/modals/DeleteModal';
import styles from '@/styles/modules/pages/programs.module.scss';
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
  programs: Program[];
  userInstitutions: Institution[];
  allInstitutions: Institution[];
}

export default function ProgramsPage({ user, programs, userInstitutions, allInstitutions }: ProgramsPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>();

  const handleAddProgram = () => {
    setSelectedProgram(undefined);
    setIsModalOpen(true);
  };

  const handleEditProgram = (programId: string) => {
    router.push(`/programs/${programId}/edit`);
  };

  const handleDeleteProgram = (program: Program) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const handleViewProgram = (programId: string) => {
    router.push(`/programs/${programId}`);
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Program Requirements</h1>
            <p className={styles.subtitle}>
              Track your progress toward program completion
            </p>
          </div>
          <button className={styles.addButton} onClick={handleAddProgram}>
            + Add Program
          </button>
        </div>

        {programs.length === 0 ? (
          <div className={styles.comingSoon}>
            <div className={styles.icon}><GraduationCap size={96} strokeWidth={1.5} /></div>
            <h2 className={styles.comingSoonTitle}>No programs yet</h2>
            <p className={styles.comingSoonText}>
              Add your first program to start tracking your progress
              toward graduation. You'll be able to define prerequisite requirements
              and ensure you meet all graduation criteria.
            </p>
            <button className={styles.addButton} onClick={handleAddProgram}>
              + Add Your First Program
            </button>
          </div>
        ) : (
          <div className={styles.programsGrid}>
            {programs.map((program) => (
              <div key={program.id} className={styles.programCard}>
                <div className={styles.programHeader}>
                  <h3 className={styles.programName}>{program.name}</h3>
                  {program.institution && (
                    <p className={styles.programInstitution}>{program.institution}</p>
                  )}
                </div>

                <div className={styles.programDetails}>
                  {program.min_prereq_gpa !== null && (
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Min Prereq GPA:</span>
                      <span className={styles.detailValue}>{program.min_prereq_gpa.toFixed(2)}</span>
                    </div>
                  )}
                  {program.min_overall_gpa !== null && (
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Min Overall GPA:</span>
                      <span className={styles.detailValue}>{program.min_overall_gpa.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.primaryAction} onClick={() => handleViewProgram(program.id)}>
                    View Details
                  </button>
                  <button className={styles.secondaryAction} onClick={() => handleEditProgram(program.id)}>
                    Edit
                  </button>
                  <button className={styles.secondaryAction} onClick={() => handleDeleteProgram(program)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ProgramModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          program={selectedProgram}
          userInstitutions={userInstitutions}
          allInstitutions={allInstitutions}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          itemType="program"
          itemId={selectedProgram?.id || ''}
          itemName={selectedProgram?.name || ''}
        />
      </div>
    </DashboardLayout>
  );
}
