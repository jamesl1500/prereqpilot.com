'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import ProgramModal from '@/components/modals/ProgramModal';
import DeleteModal from '@/components/modals/DeleteModal';
import TutorialTooltip from '@/components/onboarding/TutorialTooltip';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
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

interface ProgramsClientProps {
  programs: Array<Program & { is_official?: boolean | null; institution_id?: string | null; user_id?: string | null }>;
  userInstitutions: Institution[];
  allInstitutions: Institution[];
  onboarding: {
    onboarding_completed: boolean;
    current_step: string | null;
    steps_completed: string[];
  } | null;
}

export default function ProgramsClient({ programs, userInstitutions, allInstitutions, onboarding }: ProgramsClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState<string>('');

  const showOnboarding = !!(
    onboarding &&
    !onboarding.onboarding_completed &&
    onboarding.current_step === 'programs' &&
    !onboarding.steps_completed.includes('programs')
  );

  const handleOnboardingComplete = () => {
    router.refresh();
  };

  const { customPrograms, officialPrograms } = useMemo(() => {
    const custom = programs.filter((p) => p.is_official === false || p.user_id);
    const official = programs.filter((p) => p.is_official === true || (!p.user_id && p.institution_id));
    return { customPrograms: custom, officialPrograms: official };
  }, [programs]);

  const filteredOfficial = useMemo(() => {
    return officialPrograms.filter((p) => {
      const institutionName = typeof p.institution === 'string'
        ? p.institution
        : p.institution?.name;
      const matchesSearch = [p.name, institutionName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesInstitution = !institutionFilter || p.institution_id === institutionFilter;
      return matchesSearch && matchesInstitution;
    });
  }, [officialPrograms, searchTerm, institutionFilter]);

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
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Programs</h1>
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
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Custom Programs</h2>
                <p className={styles.sectionSubtitle}>Programs you created or imported yourself.</p>
              </div>
            </div>
            {customPrograms.length === 0 ? (
              <div className={styles.emptyState}>No custom programs yet.</div>
            ) : (
              <div className={styles.programsGrid}>
                {customPrograms.map((program) => (
                  <div key={program.id} className={styles.programCard}>
                    <div className={styles.programHeader}>
                      <h3 className={styles.programName}>{program.name}</h3>
                      {program.institution?.name && (
                        <p className={styles.programInstitution}>{program.institution.name}</p>
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
          </section>

          {process.env.NEXT_PUBLIC_ENABLE_OFFICIAL_PROGRAMS === 'true' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Official Programs</h2>
                <p className={styles.sectionSubtitle}>Verified programs from official institutions.</p>
              </div>
              <div className={styles.filters}>
                <input
                  type="search"
                  placeholder="Search official programs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search official programs"
                />
                <select
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className={styles.select}
                  aria-label="Filter by institution"
                >
                  <option value="">All institutions</option>
                  {allInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredOfficial.length === 0 ? (
              <div className={styles.emptyState}>No official programs match your search.</div>
            ) : (
              <div className={styles.programsGrid}>
                {filteredOfficial.map((program) => (
                  <div key={program.id} className={styles.programCard}>
                    <div className={styles.programHeader}>
                      <h3 className={styles.programName}>{program.name}</h3>
                      {program.institution?.name && (
                        <p className={styles.programInstitution}>{program.institution.name}</p>
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
                      {program.is_official === false && (
                        <>
                          <button className={styles.secondaryAction} onClick={() => handleEditProgram(program.id)}>
                            Edit
                          </button>
                          <button className={styles.secondaryAction} onClick={() => handleDeleteProgram(program)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}
        </>
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

      <TutorialTooltip
        tutorialType="programs"
        title="Add Your Target Program"
        description="Create the program you're aiming for so we can track prerequisites and GPA requirements." 
        position="bottom"
      />

      <OnboardingModal
        isOpen={showOnboarding}
        currentStep={onboarding?.current_step || 'dashboard_intro'}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
