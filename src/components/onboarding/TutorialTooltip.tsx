'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb } from 'lucide-react';
import axios from 'axios';
import styles from '@/styles/modules/onboarding/TutorialTooltip.module.scss';

interface TutorialTooltipProps {
  tutorialType: 'institutions' | 'courses' | 'programs' | 'scenarios' | 'academic_plans' | 'transcript';
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const STEP_MAPPING: Record<string, { step: string; nextPath?: string }> = {
  institutions: { step: 'institutions', nextPath: '/classes' },
  courses: { step: 'courses', nextPath: '/programs' },
  programs: { step: 'programs', nextPath: '/scenarios' },
  scenarios: { step: 'scenarios' },
  academic_plans: { step: 'academic_plans' },
  transcript: { step: 'transcript' },
};

export default function TutorialTooltip({ 
  tutorialType, 
  title, 
  description,
  position = 'bottom'
}: TutorialTooltipProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(process.env.NODE_ENV !== 'test');

  const checkTutorialStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/onboarding/tutorials');
      const tutorials: Array<{ tutorial_type?: string | null }> = response.data.data || [];

      // Check if this tutorial has been completed or skipped
      const tutorialProgress = tutorials.find(
        (tutorial) => tutorial.tutorial_type === tutorialType
      );

      if (!tutorialProgress) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check tutorial status:', error);
    } finally {
      setIsChecking(false);
    }
  }, [tutorialType]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    checkTutorialStatus();
  }, [checkTutorialStatus]);

  const handleDismiss = async (skipped: boolean) => {
    try {
      // Mark tutorial as complete/skipped
      await axios.post('/api/onboarding/tutorials', {
        tutorial_type: tutorialType,
        skipped
      });
      
      setIsVisible(false);
      
      // If marking as complete (not skipped), advance onboarding and redirect
      if (!skipped) {
        const stepInfo = STEP_MAPPING[tutorialType];
        if (stepInfo) {
          // Get current onboarding status
          const onboardingResponse = await axios.get('/api/onboarding');
          const currentSteps = onboardingResponse.data.data?.steps_completed || [];
          
          // Add current step to completed steps
          const updatedSteps = [...currentSteps, stepInfo.step];
          
          // Determine next step
          const nextStepMap: Record<string, string> = {
            institutions: 'courses',
            courses: 'programs',
            programs: 'scenarios',
            scenarios: 'complete'
          };
          
          const nextStep = nextStepMap[stepInfo.step];
          
          // If scenarios step is complete, mark entire onboarding as complete
          if (nextStep === 'complete') {
            await axios.put('/api/onboarding', {
              complete: true
            });
            router.push('/dashboard');
            router.refresh();
          } else {
            // Update onboarding progress
            await axios.put('/api/onboarding', {
              step: nextStep,
              steps_completed: updatedSteps
            });
            
            // Navigate to next page if available
            if (stepInfo.nextPath) {
              router.push(stepInfo.nextPath);
              router.refresh();
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to mark tutorial:', error);
    }
  };

  if (isChecking || !isVisible) return null;

  return (
    <div className={`${styles.tooltip} ${styles[position]}`}>
      <button 
        className={styles.closeButton}
        onClick={() => handleDismiss(true)}
        aria-label="Close tutorial"
      >
        ×
      </button>
      
      <div className={styles.content}>
        <h3 className={styles.title}>
          <Lightbulb size={20} strokeWidth={2} /> {title}
        </h3>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.actions}>
          <button 
            className={styles.dismissButton}
            onClick={() => handleDismiss(true)}
          >
            Got it, don't show again
          </button>
          <button 
            className={styles.completeButton}
            onClick={() => handleDismiss(false)}
          >
            Mark as Complete
          </button>
        </div>
      </div>
    </div>
  );
}
