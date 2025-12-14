'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import type { InstitutionModalProps } from '@/types/modal';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

const institutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required'),
  short_code: z.string().min(1, 'Short code is required'),
  country: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

export default function InstitutionModal({ isOpen, onClose, institution }: InstitutionModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: institution ? {
      name: institution.name,
      short_code: institution.short_code,
      country: institution.country || '',
      website: institution.website || '',
    } : undefined,
  });

  const onSubmit = async (data: InstitutionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const institutionData = {
        name: data.name,
        short_code: data.short_code,
        country: data.country || null,
        website: data.website || null,
      };

      if (institution) {
        await axios.put(`/api/institutions/${institution.id}`, institutionData);
        reset();
        router.refresh();
        onClose();
      } else {
        await axios.post('/api/institutions', institutionData);
        
        // Check if user is in onboarding and advance to next step
        try {
          const onboardingResponse = await axios.get('/api/onboarding');
          const onboarding = onboardingResponse.data.data;
          
          if (onboarding && !onboarding.onboarding_completed && onboarding.current_step === 'institutions') {
            // Mark institutions step as complete and advance to courses
            const updatedSteps = [...(onboarding.steps_completed || []), 'institutions'];
            await axios.put('/api/onboarding', {
              step: 'courses',
              steps_completed: updatedSteps
            });
            
            reset();
            onClose();
            router.push('/classes');
            return;
          }
        } catch (onboardingErr) {
          // If onboarding check fails, just continue normally
          console.error('Onboarding check failed:', onboardingErr);
        }
        
        reset();
        router.refresh();
        onClose();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {institution ? 'Edit Institution' : 'Add Institution'}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Institution Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., University of California, Berkeley"
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="short_code" className={styles.label}>
              Short Code *
            </label>
            <input
              id="short_code"
              type="text"
              {...register('short_code')}
              className={styles.input}
              placeholder="e.g., UCB"
            />
            {errors.short_code && (
              <span className={styles.fieldError}>{errors.short_code.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country" className={styles.label}>
              Country
            </label>
            <input
              id="country"
              type="text"
              {...register('country')}
              className={styles.input}
              placeholder="e.g., USA"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="website" className={styles.label}>
              Website
            </label>
            <input
              id="website"
              type="url"
              {...register('website')}
              className={styles.input}
              placeholder="https://www.example.edu"
            />
            {errors.website && (
              <span className={styles.fieldError}>{errors.website.message}</span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : institution ? 'Update' : 'Add Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
