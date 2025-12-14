'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import axios from 'axios';
import styles from '@/styles/modules/onboarding/OnboardingModal.module.scss';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
  actionPath?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'dashboard_intro',
    title: 'Welcome to Prereq Pilot!',
    description: 'Your personal academic planning assistant. We\'ll help you track courses, calculate GPAs, and plan your path to nursing school or other programs.',
    action: 'next',
    actionLabel: 'Get Started'
  },
  {
    id: 'institutions',
    title: 'Add Your Institutions',
    description: 'First, let\'s add the colleges or universities where you\'ve taken or plan to take courses. This helps organize your academic history.',
    action: 'navigate',
    actionLabel: 'Add Institution',
    actionPath: '/institutions'
  },
  {
    id: 'courses',
    title: 'Track Your Courses',
    description: 'Next, add the courses you\'ve completed. Include grades and credits to calculate your GPA automatically.',
    action: 'navigate',
    actionLabel: 'Add Courses',
    actionPath: '/classes'
  },
  {
    id: 'scenarios',
    title: 'Plan What-If Scenarios',
    description: 'Create scenarios to see how retaking courses or earning different grades would affect your GPA for program requirements.',
    action: 'navigate',
    actionLabel: 'Create Scenario',
    actionPath: '/scenarios'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You can always access these features from the navigation menu. Start planning your academic success!',
    action: 'complete',
    actionLabel: 'Start Using PrereqPilot'
  }
];

interface OnboardingModalProps {
  isOpen: boolean;
  currentStep: string;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, currentStep, onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const index = ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
    if (index !== -1) {
      setActiveStepIndex(index);
    }
  }, [currentStep]);

  const activeStep = ONBOARDING_STEPS[activeStepIndex];

  const updateOnboardingProgress = async (nextStepId: string, completed: string[]) => {
    setIsUpdating(true);
    try {
      await axios.put('/api/onboarding', {
        step: nextStepId,
        steps_completed: completed
      });
    } catch (error) {
      console.error('Failed to update onboarding progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const completeOnboarding = async () => {
    setIsUpdating(true);
    try {
      await axios.put('/api/onboarding', {
        complete: true
      });
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNext = async () => {
    const nextIndex = activeStepIndex + 1;

    if (nextIndex >= ONBOARDING_STEPS.length) {
      await completeOnboarding();
      return;
    }

    const nextStepId = ONBOARDING_STEPS[nextIndex].id;
    const completedSteps = ONBOARDING_STEPS.slice(0, nextIndex).map(s => s.id);

    await updateOnboardingProgress(nextStepId, completedSteps);
    setActiveStepIndex(nextIndex);
  };

  const handleAction = async () => {
    if (!activeStep.action) return;

    if (activeStep.action === 'complete') {
      await completeOnboarding();
      return;
    }

    if (activeStep.action === 'navigate' && activeStep.actionPath) {
      // Mark this step as visited
      const completedSteps = ONBOARDING_STEPS.slice(0, activeStepIndex + 1).map(s => s.id);
      await updateOnboardingProgress(activeStep.id, completedSteps);
      
      // Close the modal before navigation
      onComplete();
      
      // Navigate to the next page
      router.push(activeStep.actionPath);
      return;
    }

    if (activeStep.action === 'next') {
      await handleNext();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${((activeStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              />
            </div>
            <div className={styles.progressText}>
              Step {activeStepIndex + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{activeStep.title}</h2>
          <p className={styles.description}>{activeStep.description}</p>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.skipButton}
            onClick={handleSkip}
            disabled={isUpdating}
          >
            Skip Tutorial
          </button>
          
          {activeStepIndex > 0 && (
            <button 
              className={styles.backButton}
              onClick={() => setActiveStepIndex(activeStepIndex - 1)}
              disabled={isUpdating}
            >
              Back
            </button>
          )}
          
          <button 
            className={styles.actionButton}
            onClick={handleAction}
            disabled={isUpdating}
          >
            {isUpdating ? 'Loading...' : activeStep.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
