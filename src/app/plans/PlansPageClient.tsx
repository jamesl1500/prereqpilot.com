'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { AcademicPlanWithDetails } from '@/types/plan';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  CalendarDays, 
  Plus,
  GraduationCap,
  Building2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { createPlan } from '@/services/plan-service';
import styles from '@/styles/modules/pages/Plans.module.scss';

interface Institution {
  id: string;
  name: string;
  short_code: string | null;
}

interface Program {
  id: string;
  name: string;
  institution: string | null;
}

interface PlansPageClientProps {
  user: User;
  plans: AcademicPlanWithDetails[];
  institutions: Institution[];
  programs: Program[];
}

export default function PlansPageClient({ 
  user, 
  plans, 
  institutions, 
  programs,
}: PlansPageClientProps) {
  const router = useRouter();
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [programId, setProgramId] = useState('');

  const handleCreatePlan = async () => {
    if (!planName.trim()) return;

    setIsLoading(true);
    try {
      const newPlan = await createPlan({
        name: planName,
        description: planDescription || undefined,
        institution_id: institutionId || undefined,
        program_id: programId || undefined,
      });

      setPlanName('');
      setPlanDescription('');
      setInstitutionId('');
      setProgramId('');
      setShowCreatePlan(false);
      
      // Wait a bit for the database to update, then navigate to the new plan
      setTimeout(() => {
        router.push(`/plans/${newPlan.id}`);
      }, 100);
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    router.push(`/plans/${planId}`);
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Academic Plans</h1>
              <p className={styles.subtitle}>
                Organize your courses by semester and plan your path to graduation
              </p>
            </div>
            <button onClick={() => setShowCreatePlan(true)} className={styles.addButton}>
              <Plus size={18} />
              Create Plan
            </button>
          </div>
        </div>

        {/* Plans Content */}
        <div className={styles.content}>
          {plans.length > 0 ? (
            <div>
              <div className={styles.plansGrid}>
                {plans.map(plan => {
                  const termsCount = plan.plan_terms?.length || 0;
                  const coursesCount = plan.plan_terms?.reduce(
                    (sum, term) => sum + (term.planned_courses?.length || 0),
                    0
                  ) || 0;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan.id)}
                      className={styles.planCard}
                    >
                      <div className={styles.planCardHeader}>
                        <CalendarDays size={24} />
                        <ChevronRight size={20} className={styles.planCardArrow} />
                      </div>
                      <div className={styles.planCardContent}>
                        <h3>{plan.name}</h3>
                        {plan.description && (
                          <p className={styles.planDescription}>{plan.description}</p>
                        )}
                        <div className={styles.planMeta}>
                          {plan.institution && (
                            <div className={styles.planMetaItem}>
                              <Building2 size={14} />
                              <span>{plan.institution.name}</span>
                            </div>
                          )}
                          {plan.program && (
                            <div className={styles.planMetaItem}>
                              <GraduationCap size={14} />
                              <span>{plan.program.name}</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.planStats}>
                          <span>{termsCount} {termsCount === 1 ? 'term' : 'terms'}</span>
                          <span>•</span>
                          <span>{coursesCount} {coursesCount === 1 ? 'course' : 'courses'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <BookOpen size={48} strokeWidth={1.5} />
              <p>No academic plans yet</p>
              <p className={styles.emptyHint}>
                Create your first plan to start organizing your courses by semester
              </p>
              <button onClick={() => setShowCreatePlan(true)} className={styles.primaryButton}>
                <Plus size={18} />
                Create Your First Plan
              </button>
            </div>
          )}
        </div>

        {/* Create Plan Modal */}
        {showCreatePlan && (
          <div className={styles.modal} onClick={() => setShowCreatePlan(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>Create Academic Plan</h3>
              
              <div className={styles.formGroup}>
                <label>Plan Name *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., My Bachelor's Degree Plan"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Optional description..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              {institutions.length > 0 && (
                <div className={styles.formGroup}>
                  <label>Institution (Optional)</label>
                  <select
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select an institution...</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {programs.length > 0 && (
                <div className={styles.formGroup}>
                  <label>Program (Optional)</label>
                  <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select a program...</option>
                    {programs.map(prog => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowCreatePlan(false)}
                  className={styles.secondaryButton}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  className={styles.primaryButton}
                  disabled={isLoading || !planName.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
