'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import ScenarioModal from '@/components/modals/ScenarioModal';
import DeleteModal from '@/components/modals/DeleteModal';
import TutorialTooltip from '@/components/onboarding/TutorialTooltip';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import styles from '@/styles/modules/pages/scenarios.module.scss';
import type { Scenario } from '@/types/scenario';

interface OnboardingData {
  onboarding_completed: boolean;
  current_step: string | null;
  steps_completed: string[];
}

interface ScenariosClientProps {
  scenarios: Scenario[];
  onboarding: OnboardingData | null;
}

export default function ScenariosClient({ scenarios, onboarding }: ScenariosClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | undefined>();

  const showOnboarding = !!(
    onboarding &&
    !onboarding.onboarding_completed &&
    onboarding.current_step === 'scenarios' &&
    !onboarding.steps_completed.includes('scenarios')
  );

  const handleOnboardingComplete = () => {
    router.refresh();
  };

  const handleAddScenario = () => {
    setSelectedScenario(undefined);
    setIsModalOpen(true);
  };

  const handleEditScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsModalOpen(true);
  };

  const handleDeleteScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsDeleteModalOpen(true);
  };

  const handleOpenScenario = (scenarioId: string) => {
    router.push(`/scenarios/${scenarioId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>What-If Scenarios</h1>
          <p className={styles.subtitle}>
            Plan your academic future with scenario modeling
          </p>
        </div>
        <button className={styles.addButton} onClick={handleAddScenario}>
          + Create Scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <div className={styles.comingSoon}>
          <div className={styles.icon}>
            <Sparkles size={80} strokeWidth={1.5} />
          </div>
          <h2 className={styles.comingSoonTitle}>No scenarios yet</h2>
          <p className={styles.comingSoonText}>
            Create your first what-if scenario to explore different course combinations,
            predict outcomes, and make informed decisions about your academic path.
          </p>
          <button className={styles.addButton} onClick={handleAddScenario}>
            + Create Your First Scenario
          </button>
        </div>
      ) : (
        <div className={styles.scenariosGrid}>
          {scenarios.map((scenario) => (
            <div key={scenario.id} className={styles.scenarioCard}>
              <div className={styles.scenarioHeader}>
                <h3 className={styles.scenarioName}>{scenario.name}</h3>
                {scenario.created_at && (
                  <p className={styles.scenarioDate}>
                    Created {new Date(scenario.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {scenario.description && (
                <p className={styles.scenarioDescription}>{scenario.description}</p>
              )}

              <div className={styles.cardActions}>
                <button 
                  className={styles.primaryAction}
                  onClick={() => handleOpenScenario(scenario.id)}
                >
                  Open Scenario
                </button>
                <button className={styles.secondaryAction} onClick={() => handleEditScenario(scenario)}>
                  Edit
                </button>
                <button className={styles.secondaryAction} onClick={() => handleDeleteScenario(scenario)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ScenarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scenario={selectedScenario}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        itemType="scenario"
        itemId={selectedScenario?.id || ''}
        itemName={selectedScenario?.name || ''}
      />

      <TutorialTooltip
        tutorialType="scenarios"
        title="Create What-If Scenarios"
        description="Plan hypothetical course outcomes to see how they affect your GPA. Perfect for planning retakes or future semesters!"
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
